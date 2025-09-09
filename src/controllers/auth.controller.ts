import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, user_type, full_name } = req.body;

    const result = await AuthService.register({
      email,
      password,
      user_type,
      full_name,
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
      message:
        "User registered successfully. Please check your email for verification.",
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, user_type } = req.body;

    const result = await AuthService.login(email, password, user_type);

    res.json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
      message: "Login successful",
    });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: { tokens },
      message: "Token refreshed successfully",
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    await AuthService.logout(refreshToken);

    res.json({
      success: true,
      message: "Logout successful",
    });
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    await AuthService.verifyEmail(parseInt(userId));

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  });

  static requestPasswordReset = asyncHandler(
    async (req: Request, res: Response) => {
      const { email } = req.body;

      await AuthService.requestPasswordReset(email);

      res.json({
        success: true,
        message:
          "If an account with that email exists, we have sent a password reset link.",
      });
    }
  );

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    await AuthService.resetPassword(token, password);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  });

  static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        is_verified: user.is_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      message: "Profile retrieved successfully",
    });
  });
}
