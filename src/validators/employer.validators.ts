import Joi from "joi";

export const employerSchemas = {
  // Unauthenticated company creation (for onboarding)
  createCompanyUnauthenticated: Joi.object({
    company_name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Company name must be at least 2 characters long",
      "string.max": "Company name cannot exceed 100 characters",
      "any.required": "Company name is required",
    }),
    industry: Joi.string().max(50).optional(),
    company_size: Joi.string().max(50).optional(),
    location: Joi.string().max(100).optional(),
    website: Joi.string().uri().optional().messages({
      "string.uri": "Website must be a valid URL",
    }),
    description: Joi.string().max(2000).default(""),
    company_values: Joi.array().items(Joi.string()).default([]),
    work_culture: Joi.string().max(2000).default(""),
    has_video_intro: Joi.boolean().default(false),
    video_intro_url: Joi.string().uri().optional().allow(null).messages({
      "string.uri": "Video intro URL must be a valid URL",
    }),
  }),

  // Claim company validation
  claimCompany: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Company ID must be a number",
      "number.integer": "Company ID must be an integer",
      "number.positive": "Company ID must be positive",
      "any.required": "Company ID is required",
    }),
  }),

  claimCompanyBody: Joi.object({
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
    full_name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
  }),

  // Update company by ID validation
  updateCompanyById: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Company ID must be a number",
      "number.integer": "Company ID must be an integer",
      "number.positive": "Company ID must be positive",
      "any.required": "Company ID is required",
    }),
  }),

  // Create job for company validation
  createJobForCompany: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Company ID must be a number",
      "number.integer": "Company ID must be an integer",
      "number.positive": "Company ID must be positive",
      "any.required": "Company ID is required",
    }),
  }),

  // Publish company validation
  publishCompany: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Company ID must be a number",
      "number.integer": "Company ID must be an integer",
      "number.positive": "Company ID must be positive",
      "any.required": "Company ID is required",
    }),
  }),

  // Company update validation
  updateCompany: Joi.object({
    company_name: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Company name must be at least 2 characters long",
      "string.max": "Company name cannot exceed 100 characters",
    }),
    industry: Joi.string().max(50).optional(),
    company_size: Joi.string().max(50).optional(),
    location: Joi.string().max(100).optional(),
    website: Joi.string().uri().optional().messages({
      "string.uri": "Website must be a valid URL",
    }),
    description: Joi.string().max(2000).optional(),
    company_values: Joi.array().items(Joi.string()).optional(),
    work_culture: Joi.string().max(2000).optional(),
    has_video_intro: Joi.boolean().optional(),
    video_intro_url: Joi.string().uri().optional().allow(null).messages({
      "string.uri": "Video intro URL must be a valid URL",
    }),
  }),

  // Get company by ID validation
  getCompanyById: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Company ID must be a number",
      "number.integer": "Company ID must be an integer",
      "number.positive": "Company ID must be positive",
      "any.required": "Company ID is required",
    }),
  }),

  // Search companies validation
  searchCompanies: Joi.object({
    industries: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    company_size: Joi.string().optional(),
    location: Joi.string().max(100).optional().messages({
      "string.max": "Location cannot exceed 100 characters",
    }),
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
  }),

  // Job creation validation
  createJob: Joi.object({
    job_title: Joi.string().min(2).max(100).required().messages({
      "string.min": "Job title must be at least 2 characters long",
      "string.max": "Job title cannot exceed 100 characters",
      "any.required": "Job title is required",
    }),
    department: Joi.string().max(50).optional(),
    employment_type: Joi.string()
      .valid("full-time", "part-time", "contract", "internship")
      .default("full-time")
      .messages({
        "any.only": "Employment type must be full-time, part-time, contract, or internship",
      }),
    working_model: Joi.string()
      .valid("remote", "hybrid", "onsite")
      .default("remote")
      .messages({
        "any.only": "Working model must be remote, hybrid, or onsite",
      }),
    location: Joi.string().max(100).optional(),
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
    salary_currency: Joi.string().length(3).default("USD").messages({
      "string.length": "Currency code must be exactly 3 characters",
    }),
    experience_level: Joi.string().max(50).optional(),
    requirements: Joi.array().items(Joi.string()).default([]),
    responsibilities: Joi.array().items(Joi.string()).default([]),
    benefits: Joi.array().items(Joi.string()).default([]),
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

  // Job update validation
  updateJob: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Job ID must be a number",
      "number.integer": "Job ID must be an integer",
      "number.positive": "Job ID must be positive",
      "any.required": "Job ID is required",
    }),
  }),

  updateJobBody: Joi.object({
    job_title: Joi.string().min(2).max(100).optional().messages({
      "string.min": "Job title must be at least 2 characters long",
      "string.max": "Job title cannot exceed 100 characters",
    }),
    department: Joi.string().max(50).optional(),
    employment_type: Joi.string()
      .valid("full-time", "part-time", "contract", "internship")
      .optional()
      .messages({
        "any.only": "Employment type must be full-time, part-time, contract, or internship",
      }),
    working_model: Joi.string()
      .valid("remote", "hybrid", "onsite")
      .optional()
      .messages({
        "any.only": "Working model must be remote, hybrid, or onsite",
      }),
    location: Joi.string().max(100).optional(),
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
    salary_currency: Joi.string().length(3).optional().messages({
      "string.length": "Currency code must be exactly 3 characters",
    }),
    experience_level: Joi.string().max(50).optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
    responsibilities: Joi.array().items(Joi.string()).optional(),
    benefits: Joi.array().items(Joi.string()).optional(),
    is_active: Joi.boolean().optional(),
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

  // Delete job validation
  deleteJob: Joi.object({
    id: Joi.number().integer().positive().required().messages({
      "number.base": "Job ID must be a number",
      "number.integer": "Job ID must be an integer",
      "number.positive": "Job ID must be positive",
      "any.required": "Job ID is required",
    }),
  }),
};
