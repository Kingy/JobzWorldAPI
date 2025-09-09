import { Request, Response, NextFunction } from "express";
import { ValidationError } from "joi";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { message } = error;
  let statusCode = 500;

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  } else if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.details.map((detail) => detail.message).join(", ");
  } else if (error.message.includes("duplicate key")) {
    statusCode = 409;
    message = "Resource already exists";
  } else if (error.message.includes("foreign key")) {
    statusCode = 400;
    message = "Invalid reference to related resource";
  } else if (error.message.includes("not found")) {
    statusCode = 404;
    message = "Resource not found";
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
