import { query } from "../database/connection";
import { User } from "../types";
import { AppError } from "../middleware/errorHandler";

export class UserService {
  static async getUserById(id: number): Promise<User | null> {
    const result = await query(
      "SELECT id, email, password_hash, user_type, is_verified, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );

    return result.rows[0] || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await query(
      "SELECT id, email, password_hash, user_type, is_verified, created_at, updated_at FROM users WHERE email = $1",
      [email]
    );

    return result.rows[0] || null;
  }

  static async updateUser(
    id: number,
    updates: Partial<Pick<User, "email" | "is_verified">>
  ): Promise<User> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    if (!setClause) {
      throw new AppError("No valid fields to update", 400);
    }

    const result = await query(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, password_hash, user_type, is_verified, created_at, updated_at`,
      [id, ...Object.values(updates)]
    );

    if (result.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    return result.rows[0];
  }

  static async deleteUser(id: number): Promise<void> {
    const result = await query("DELETE FROM users WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      throw new AppError("User not found", 404);
    }
  }

  static async getAllUsers(
    filters: {
      page?: number;
      limit?: number;
      user_type?: "candidate" | "employer";
      is_verified?: boolean;
    } = {}
  ): Promise<{ users: Omit<User, "password_hash">[]; total: number }> {
    const { page = 1, limit = 20, user_type, is_verified } = filters;
    const offset = (page - 1) * limit;

    let whereClause = "";
    const whereParams: any[] = [];
    let paramIndex = 1;

    if (user_type) {
      whereClause += ` WHERE user_type = $${paramIndex}`;
      whereParams.push(user_type);
      paramIndex++;
    }

    if (is_verified !== undefined) {
      whereClause += whereClause ? " AND" : " WHERE";
      whereClause += ` is_verified = $${paramIndex}`;
      whereParams.push(is_verified);
      paramIndex++;
    }

    // Get users
    const usersResult = await query(
      `SELECT id, email, user_type, is_verified, created_at, updated_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...whereParams, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      whereParams
    );

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }
}
