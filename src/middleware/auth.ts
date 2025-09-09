import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, TokenPayload } from "../types";
import { UserService } from "../services/user.service";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Get user from database
    const user = await UserService.getUserById(payload.userId);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token - user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ message: "Token expired" });
    }
    return res.status(500).json({ message: "Authentication error" });
  }
};

export const requireRole = (role: "candidate" | "employer") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.user_type !== role) {
      return res
        .status(403)
        .json({ message: `Access denied. ${role} role required` });
    }

    next();
  };
};

export const requireVerified = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.is_verified) {
    return res.status(403).json({ message: "Email verification required" });
  }

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const payload = jwt.verify(token, jwtSecret) as TokenPayload;
        const user = await UserService.getUserById(payload.userId);
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
