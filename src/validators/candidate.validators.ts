import Joi from "joi";

const skillSchema = Joi.object({
  name: Joi.string().required(),
  proficiency: Joi.string()
    .valid("beginner", "intermediate", "advanced", "expert")
    .required(),
});

export const candidateSchemas = {
  // Unauthenticated profile creation (for onboarding)
  createProfileUnauthenticated: Joi.object({
    full_name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
    location: Joi.string().max(100).optional().allow(""),
    has_work_authorization: Joi.boolean().default(false),
    languages: Joi.array().items(Joi.string()).default([]),
    years_experience: Joi.number().integer().min(0).max(50).default(0),
    target_job_titles: Joi.array().items(Joi.string()).default([]),
    preferred_industries: Joi.array().items(Joi.string()).default([]),
    working_model: Joi.string()
      .valid("remote", "hybrid", "onsite")
      .default("remote"),
    salary_min: Joi.number().integer().min(0).optional().allow(null),
    salary_max: Joi.number().integer().min(0).optional().allow(null),
    salary_currency: Joi.string().length(3).default("USD"),
    is_willing_to_relocate: Joi.boolean().default(false),
    skills: Joi.array().items(skillSchema).default([]),
    achievements: Joi.string().max(2000).default("").allow(""),
    has_consented_ai_analysis: Joi.boolean().default(false),
  }).custom((value, helpers) => {
    if (
      value.salary_min &&
      value.salary_max &&
      value.salary_min > value.salary_max
    ) {
      return helpers.error("any.custom", {
        message: "Minimum salary cannot be greater than maximum salary",
      });
    }
    return value;
  }),

  // Claim profile validation
  claimProfile: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Profile ID must be a number",
      "number.integer": "Profile ID must be an integer",
      "number.positive": "Profile ID must be positive",
      "any.required": "Profile ID is required",
    }),
  }),

  claimProfileBody: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "any.required": "Password is required",
    }),
    full_name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
  }),

  // Update profile by ID validation
  updateProfileById: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Profile ID must be a number",
      "number.integer": "Profile ID must be an integer",
      "number.positive": "Profile ID must be positive",
      "any.required": "Profile ID is required",
    }),
  }),

  // Original authenticated profile creation
  createProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
    location: Joi.string().max(100).optional().allow(""),
    has_work_authorization: Joi.boolean().default(false),
    languages: Joi.array().items(Joi.string()).default([]),
    years_experience: Joi.number().integer().min(0).max(50).default(0),
    target_job_titles: Joi.array().items(Joi.string()).default([]),
    preferred_industries: Joi.array().items(Joi.string()).default([]),
    working_model: Joi.string()
      .valid("remote", "hybrid", "onsite")
      .default("remote"),
    salary_min: Joi.number().integer().min(0).optional().allow(null),
    salary_max: Joi.number().integer().min(0).optional().allow(null),
    salary_currency: Joi.string().length(3).default("USD"),
    is_willing_to_relocate: Joi.boolean().default(false),
    skills: Joi.array().items(skillSchema).default([]),
    achievements: Joi.string().max(2000).default("").allow(""),
    has_consented_ai_analysis: Joi.boolean().default(false),
  }).custom((value, helpers) => {
    if (
      value.salary_min &&
      value.salary_max &&
      value.salary_min > value.salary_max
    ) {
      return helpers.error("any.custom", {
        message: "Minimum salary cannot be greater than maximum salary",
      });
    }
    return value;
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
    }),
    location: Joi.string().max(100).optional().allow(""),
    has_work_authorization: Joi.boolean().optional(),
    languages: Joi.array().items(Joi.string()).optional(),
    years_experience: Joi.number()
      .integer()
      .min(0)
      .max(50)
      .optional()
      .messages({
        "number.base": "Years of experience must be a number",
        "number.integer": "Years of experience must be an integer",
        "number.min": "Years of experience cannot be negative",
        "number.max": "Years of experience cannot exceed 50",
      }),
    target_job_titles: Joi.array().items(Joi.string()).optional(),
    preferred_industries: Joi.array().items(Joi.string()).optional(),
    working_model: Joi.string()
      .valid("remote", "hybrid", "onsite")
      .optional()
      .messages({
        "any.only": "Working model must be remote, hybrid, or onsite",
      }),
    salary_min: Joi.number().integer().min(0).optional().allow(null).messages({
      "number.base": "Minimum salary must be a number",
      "number.integer": "Minimum salary must be an integer",
      "number.min": "Minimum salary cannot be negative",
    }),
    salary_max: Joi.number().integer().min(0).optional().allow(null).messages({
      "number.base": "Maximum salary must be a number",
      "number.integer": "Maximum salary must be an integer",
      "number.min": "Maximum salary cannot be negative",
    }),
    salary_currency: Joi.string().length(3).optional().messages({
      "string.length": "Currency code must be exactly 3 characters",
    }),
    is_willing_to_relocate: Joi.boolean().optional(),
    skills: Joi.array().items(skillSchema).optional(),
    achievements: Joi.string().max(2000).optional().allow("").messages({
      "string.max": "Achievements cannot exceed 2000 characters",
    }),
    has_consented_ai_analysis: Joi.boolean().optional(),
    is_profile_complete: Joi.boolean().optional(),
  }).custom((value, helpers) => {
    if (
      value.salary_min &&
      value.salary_max &&
      value.salary_min > value.salary_max
    ) {
      return helpers.error("any.custom", {
        message: "Minimum salary cannot be greater than maximum salary",
      });
    }
    return value;
  }),

  // Get profile by ID validation
  getProfileById: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Profile ID must be a number",
      "number.integer": "Profile ID must be an integer",
      "number.positive": "Profile ID must be positive",
      "any.required": "Profile ID is required",
    }),
  }),

  // Complete profile validation
  completeProfile: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Profile ID must be a number",
      "number.integer": "Profile ID must be an integer",
      "number.positive": "Profile ID must be positive",
      "any.required": "Profile ID is required",
    }),
  }),

  // Search profiles validation
  searchProfiles: Joi.object({
    skills: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    experience_min: Joi.number().integer().min(0).optional().messages({
      "number.base": "Minimum experience must be a number",
      "number.integer": "Minimum experience must be an integer",
      "number.min": "Minimum experience cannot be negative",
    }),
    experience_max: Joi.number().integer().min(0).optional().messages({
      "number.base": "Maximum experience must be a number",
      "number.integer": "Maximum experience must be an integer",
      "number.min": "Maximum experience cannot be negative",
    }),
    working_model: Joi.string()
      .valid("remote", "hybrid", "onsite")
      .optional()
      .messages({
        "any.only": "Working model must be remote, hybrid, or onsite",
      }),
    location: Joi.string().max(100).optional().messages({
      "string.max": "Location cannot exceed 100 characters",
    }),
    salary_min: Joi.number().integer().min(0).optional().messages({
      "number.base": "Minimum salary must be a number",
      "number.integer": "Minimum salary must be an integer",
      "number.min": "Minimum salary cannot be negative",
    }),
    salary_max: Joi.number().integer().min(0).optional().messages({
      "number.base": "Maximum salary must be a number",
      "number.integer": "Maximum salary must be an integer",
      "number.min": "Maximum salary cannot be negative",
    }),
    languages: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    industries: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
  }).custom((value, helpers) => {
    // Custom validation for experience range
    if (
      value.experience_min !== undefined &&
      value.experience_max !== undefined &&
      value.experience_min > value.experience_max
    ) {
      return helpers.error("any.custom", {
        message: "Minimum experience cannot be greater than maximum experience",
      });
    }

    // Custom validation for salary range
    if (
      value.salary_min !== undefined &&
      value.salary_max !== undefined &&
      value.salary_min > value.salary_max
    ) {
      return helpers.error("any.custom", {
        message: "Minimum salary cannot be greater than maximum salary",
      });
    }

    return value;
  }),
};
