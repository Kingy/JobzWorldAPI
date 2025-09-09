import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  keyPrefix: "jobzworld_api",
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60, // Convert minutes to seconds
});

const authRateLimiter = new RateLimiterMemory({
  keyPrefix: "auth_api",
  points: 5, // 5 attempts
  duration: 15 * 60, // 15 minutes
  blockDuration: 15 * 60, // Block for 15 minutes after limit exceeded
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", String(secs));
    res.status(429).json({
      message: "Too many requests",
      retryAfter: secs,
    });
  }
};

export const authRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set("Retry-After", String(secs));
    res.status(429).json({
      message: "Too many authentication attempts. Please try again later.",
      retryAfter: secs,
    });
  }
};

export { rateLimiterMiddleware as rateLimiter };
