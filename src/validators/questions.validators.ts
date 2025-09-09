// src/validators/questions.validators.ts
import Joi from "joi";

export const questionsSchemas = {
  getQuestions: Joi.object({
    jobTitles: Joi.string().required().messages({
      "any.required": "Job titles parameter is required",
    }),
  }),
};