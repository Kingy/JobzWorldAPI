import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate, validateParams } from "../middleware/validation";
import { authRateLimiterMiddleware } from "../middleware/rateLimiter";
import { authenticateToken } from "../middleware/auth";
import { authSchemas } from "../validators/auth.validators";

const router = Router();

// Apply auth rate limiting to all routes
router.use(authRateLimiterMiddleware);

// Public routes
router.post(
  "/register",
  validate(authSchemas.register),
  AuthController.register
);
router.post("/login", validate(authSchemas.login), AuthController.login);
router.post(
  "/refresh-token",
  validate(authSchemas.refreshToken),
  AuthController.refreshToken
);
router.post("/logout", validate(authSchemas.logout), AuthController.logout);
router.post(
  "/request-password-reset",
  validate(authSchemas.requestPasswordReset),
  AuthController.requestPasswordReset
);
router.post(
  "/reset-password",
  validate(authSchemas.resetPassword),
  AuthController.resetPassword
);
router.post(
  "/verify-email/:userId",
  validateParams(authSchemas.verifyEmail),
  AuthController.verifyEmail
);

// Protected routes
router.get("/profile", authenticateToken, AuthController.getProfile);

export default router;
