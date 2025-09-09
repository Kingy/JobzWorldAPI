// src/validators/video.validators.ts
import Joi from "joi";

export const videoSchemas = {
  uploadVideo: Joi.object({
    candidateProfileId: Joi.number().integer().positive().required().messages({
      "number.base": "Candidate profile ID must be a number",
      "number.integer": "Candidate profile ID must be an integer",
      "number.positive": "Candidate profile ID must be positive",
      "any.required": "Candidate profile ID is required",
    }),
    questionText: Joi.string().min(1).max(1000).required().messages({
      "string.min": "Question text cannot be empty",
      "string.max": "Question text cannot exceed 1000 characters",
      "any.required": "Question text is required",
    }),
    videoBlob: Joi.string().required().messages({
      "any.required": "Video data is required",
    }),
    durationSeconds: Joi.number().integer().min(1).max(300).required().messages({
      "number.base": "Duration must be a number",
      "number.integer": "Duration must be an integer",
      "number.min": "Duration must be at least 1 second",
      "number.max": "Duration cannot exceed 300 seconds (5 minutes)",
      "any.required": "Duration is required",
    }),
    responseOrder: Joi.number().integer().min(1).required().messages({
      "number.base": "Response order must be a number",
      "number.integer": "Response order must be an integer",
      "number.min": "Response order must be at least 1",
      "any.required": "Response order is required",
    }),
  }),

  getVideos: Joi.object({
    candidateProfileId: Joi.number().integer().positive().required(),
  }),

  updateVideoStatus: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  updateVideoStatusBody: Joi.object({
    status: Joi.string()
      .valid("pending", "ready", "processing", "failed")
      .required()
      .messages({
        "any.only": "Status must be one of: pending, ready, processing, failed",
        "any.required": "Status is required",
      }),
  }),

  deleteVideo: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};