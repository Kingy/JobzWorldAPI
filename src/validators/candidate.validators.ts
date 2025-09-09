import Joi from "joi";

const skillSchema = Joi.object({
  name: Joi.string().required(),
  proficiency: Joi.string()
    .valid("beginner", "intermediate", "advanced", "expert")
    .required(),
});

export const candidateSchemas = {
  createProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
      "any.required": "Full name is required",
    }),
    location: Joi.string().max(100).optional(),
    has_work_authorization: Joi.boolean().default(false),
    languages: Joi.array().items(Joi.string()).default([]),
    years_experience: Joi.number().integer().min(0).max(50).default(0),
    target_job_titles: Joi.array().items(Joi.string()).default([]),
    preferred_industries: Joi.array().items(Joi.string()).default([]),
    working_model: Joi.string()
      .valid("remote", "hybrid", "onsite")
      .default("remote"),
    salary_min: Joi.number().integer().min(0).optional(),
    salary_max: Joi.number().integer().min(0).optional(),
    salary_currency: Joi.string().length(3).default("USD"),
    is_willing_to_relocate: Joi.boolean().default(false),
    skills: Joi.array().items(skillSchema).default([]),
    achievements: Joi.string().max(2000).default(""),
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
    full_name: Joi.string().min(2).max(100).optional(),
    location: Joi.string().max(100).optional(),
    has_work_authorization: Joi.boolean().optional(),
    languages: Joi.array().items(Joi.string()).optional(),
    years_experience: Joi.number().integer().min(0).max(50).optional(),
    target_job_titles: Joi.array().items(Joi.string()).optional(),
    preferred_industries: Joi.array().items(Joi.string()).optional(),
    working_model: Joi.string().valid("remote", "hybrid", "onsite").optional(),
    salary_min: Joi.number().integer().min(0).optional(),
    salary_max: Joi.number().integer().min(0).optional(),
    salary_currency: Joi.string().length(3).optional(),
    is_willing_to_relocate: Joi.boolean().optional(),
    skills: Joi.array().items(skillSchema).optional(),
    achievements: Joi.string().max(2000).optional(),
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

  getProfileById: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  completeProfile: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  searchProfiles: Joi.object({
    skills: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    experience_min: Joi.number().integer().min(0).optional(),
    experience_max: Joi.number().integer().min(0).optional(),
    working_model: Joi.string().valid("remote", "hybrid", "onsite").optional(),
    location: Joi.string().max(100).optional(),
    salary_min: Joi.number().integer().min(0).optional(),
    salary_max: Joi.number().integer().min(0).optional(),
    languages: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    industries: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
