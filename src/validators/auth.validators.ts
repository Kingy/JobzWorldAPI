import Joi from "joi";

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
        )
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),
    user_type: Joi.string().valid("candidate", "employer").required().messages({
      "any.only": "User type must be either candidate or employer",
      "any.required": "User type is required",
    }),
    full_name: Joi.string()
      .min(2)
      .max(100)
      .when("user_type", {
        is: "candidate",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .messages({
        "string.min": "Full name must be at least 2 characters long",
        "string.max": "Full name cannot exceed 100 characters",
        "any.required": "Full name is required for candidates",
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
    user_type: Joi.string().valid("candidate", "employer").required().messages({
      "any.only": "User type must be either candidate or employer",
      "any.required": "User type is required",
    }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "Refresh token is required",
    }),
  }),

  logout: Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "Refresh token is required",
    }),
  }),

  requestPasswordReset: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
        )
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "any.required": "Password is required",
      }),
  }),

  verifyEmail: Joi.object({
    userId: Joi.number().integer().positive().required().messages({
      "number.base": "User ID must be a number",
      "number.integer": "User ID must be an integer",
      "number.positive": "User ID must be positive",
      "any.required": "User ID is required",
    }),
  }),
};
