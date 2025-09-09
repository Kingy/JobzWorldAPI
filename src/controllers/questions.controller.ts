// src/controllers/questions.controller.ts
import { Request, Response } from "express";
import { QuestionsService } from "../services/questions.service";
import { asyncHandler } from "../middleware/errorHandler";

export class QuestionsController {
  static getQuestionsByJobTitles = asyncHandler(
    async (req: Request, res: Response) => {
      const { jobTitles } = req.params;
      const jobTitlesArray = jobTitles.split(",").map((title) => title.trim());

      const questions = await QuestionsService.getQuestionsByJobTitles(
        jobTitlesArray
      );

      res.json({
        success: true,
        data: { questions },
        message: "Interview questions retrieved successfully",
      });
    }
  );
}