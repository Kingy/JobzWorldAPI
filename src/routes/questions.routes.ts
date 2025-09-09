// src/routes/questions.routes.ts
import { Router } from "express";
import { QuestionsController } from "../controllers/questions.controller";
import { validateParams } from "../middleware/validation";
import { questionsSchemas } from "../validators/questions.validators";
const router = Router();

// Get interview questions based on job titles
router.get(
  "/:jobTitles",
  validateParams(questionsSchemas.getQuestions),
  QuestionsController.getQuestionsByJobTitles
);

export default router;