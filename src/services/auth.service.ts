import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { query } from "../database/connection";
import { User, TokenPayload, TokenPair } from "../types";
import { AppError } from "../middleware/errorHandler";
import { EmailService } from "./email.service";

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ACCESS_TOKEN_EXPIRY =
    process.env.JWT_ACCESS_EXPIRY || "15m";
  private static readonly REFRESH_TOKEN_EXPIRY =
    process.env.JWT_REFRESH_EXPIRY || "7d";

  static async register(userData: {
    email: string;
    password: string;
    user_type: "candidate" | "employer";
    full_name?: string;
  }): Promise<{ user: Omit<User, "password_hash">; tokens: TokenPair }> {
    const { email, password, user_type, full_name } = userData;

    // Check if user already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new AppError("User already exists with this email", 409);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user
    const userResult = await query(
      "INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id, email, user_type, is_verified, created_at, updated_at",
      [email, password_hash, user_type]
    );

    const user = userResult.rows[0];

    // Create candidate profile if user is candidate
    if (user_type === "candidate" && full_name) {
      await query(
        "INSERT INTO candidate_profiles (user_id, full_name) VALUES ($1, $2)",
        [user.id, full_name]
      );
    }

    // Generate tokens
    const tokens = this.generateTokenPair({
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Send verification email
    await EmailService.sendVerificationEmail(user.email, user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      tokens,
    };
  }

  static async login(
    email: string,
    password: string,
    user_type: "candidate" | "employer"
  ): Promise<{ user: Omit<User, "password_hash">; tokens: TokenPair }> {
    // Get user from database
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check user type
    if (user.user_type !== user_type) {
      throw new AppError("Invalid credentials", 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate tokens
    const tokens = this.generateTokenPair({
      userId: user.id,
      email: user.email,
      userType: user.user_type,
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      tokens,
    };
  }

  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtRefreshSecret) {
        throw new Error("JWT refresh secret is not configured");
      }

      const payload = jwt.verify(
        refreshToken,
        jwtRefreshSecret
      ) as TokenPayload;

      // Check if refresh token exists in database
      const tokenResult = await query(
        "SELECT user_id FROM user_sessions WHERE id = $1 AND expires_at > NOW()",
        [refreshToken]
      );

      if (tokenResult.rows.length === 0) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Generate new token pair
      const tokens = this.generateTokenPair({
        userId: payload.userId,
        email: payload.email,
        userType: payload.userType,
      });

      // Update refresh token in database
      await this.storeRefreshToken(payload.userId, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    await query("DELETE FROM user_sessions WHERE id = $1", [refreshToken]);
  }

  static async verifyEmail(userId: number): Promise<void> {
    await query("UPDATE users SET is_verified = TRUE WHERE id = $1", [userId]);
  }

  static async requestPasswordReset(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token using crypto instead of uuid
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, resetToken, expiresAt]
    );

    // Send reset email
    await EmailService.sendPasswordResetEmail(user.email, resetToken);
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    // Verify reset token
    const tokenResult = await query(
      "SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL",
      [token]
    );

    if (tokenResult.rows.length === 0) {
      throw new AppError("Invalid or expired reset token", 400);
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      password_hash,
      userId,
    ]);

    // Mark reset token as used
    await query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1",
      [token]
    );
  }

  private static generateTokenPair(payload: TokenPayload): TokenPair {
    //@ts-ignore
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    //@ts-ignore
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  private static async storeRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Remove existing sessions for user
    await query("DELETE FROM user_sessions WHERE user_id = $1", [userId]);

    // Store new refresh token
    await query(
      "INSERT INTO user_sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
      [refreshToken, userId, expiresAt]
    );
  }

  private static async getUserByEmail(email: string): Promise<User | null> {
    const result = await query(
      "SELECT id, email, password_hash, user_type, is_verified, created_at, updated_at FROM users WHERE email = $1",
      [email]
    );

    return result.rows[0] || null;
  }
}
