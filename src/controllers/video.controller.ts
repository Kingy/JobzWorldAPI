// src/controllers/video.controller.ts
import { Request, Response } from "express";
import { VideoService } from "../services/video.service";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export class VideoController {
  static uploadVideo = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      candidateProfileId,
      questionText,
      videoBlob,
      durationSeconds,
      responseOrder,
    } = req.body;

    // Verify the candidate profile belongs to the authenticated user
    const userId = req.user!.id;
    await VideoService.verifyCandidateOwnership(candidateProfileId, userId);

    const videoResponse = await VideoService.uploadVideo({
      candidateProfileId,
      questionText,
      videoBlob,
      durationSeconds,
      responseOrder,
    });

    res.status(201).json({
      success: true,
      data: videoResponse,
      message: "Video uploaded successfully",
    });
  });

  static getVideosByCandidate = asyncHandler(
    async (req: Request, res: Response) => {
      const { candidateProfileId } = req.params;

      const videos = await VideoService.getVideosByCandidate(
        parseInt(candidateProfileId)
      );

      res.json({
        success: true,
        data: videos,
        message: "Videos retrieved successfully",
      });
    }
  );

  static updateVideoStatus = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { status } = req.body;

      const video = await VideoService.updateVideoStatus(
        parseInt(id),
        status
      );

      res.json({
        success: true,
        data: video,
        message: "Video status updated successfully",
      });
    }
  );

  static deleteVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await VideoService.deleteVideo(parseInt(id));

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  });
}