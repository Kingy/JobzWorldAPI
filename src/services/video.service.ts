// src/services/video.service.ts
import { query } from "../database/connection";
import { VideoResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto"; // Use Node.js built-in crypto

export class VideoService {
  static async uploadVideo(videoData: {
    candidateProfileId: number;
    questionText: string;
    videoBlob: string; // base64 encoded
    durationSeconds: number;
    responseOrder: number;
  }): Promise<VideoResponse> {
    const {
      candidateProfileId,
      questionText,
      videoBlob,
      durationSeconds,
      responseOrder,
    } = videoData;

    // Generate unique filename using crypto.randomUUID()
    const videoId = randomUUID();
    const fileName = `${videoId}.webm`;
    const uploadDir = process.env.VIDEO_UPLOAD_DIR || "./uploads/videos";
    const filePath = path.join(uploadDir, fileName);

    try {
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Convert base64 to buffer and save file
      const videoBuffer = Buffer.from(videoBlob, "base64");
      await fs.writeFile(filePath, videoBuffer);

      // Save video record to database
      const result = await query(
        `INSERT INTO video_responses (
          candidate_profile_id, question_text, video_url, duration_seconds,
          status, response_order
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          candidateProfileId,
          questionText,
          filePath,
          durationSeconds,
          "ready",
          responseOrder,
        ]
      );

      return result.rows[0];
    } catch (error) {
      // Clean up file if database insert fails
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error("Error cleaning up video file:", unlinkError);
      }
      throw error;
    }
  }

  static async getVideosByCandidate(
    candidateProfileId: number
  ): Promise<VideoResponse[]> {
    const result = await query(
      "SELECT * FROM video_responses WHERE candidate_profile_id = $1 ORDER BY response_order ASC",
      [candidateProfileId]
    );
    return result.rows;
  }

  static async updateVideoStatus(
    id: number,
    status: string
  ): Promise<VideoResponse> {
    const result = await query(
      "UPDATE video_responses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new AppError("Video response not found", 404);
    }

    return result.rows[0];
  }

  static async deleteVideo(id: number): Promise<void> {
    // Get video info before deletion
    const videoResult = await query(
      "SELECT video_url FROM video_responses WHERE id = $1",
      [id]
    );

    if (videoResult.rows.length === 0) {
      throw new AppError("Video response not found", 404);
    }

    const videoUrl = videoResult.rows[0].video_url;

    // Delete from database
    const deleteResult = await query(
      "DELETE FROM video_responses WHERE id = $1",
      [id]
    );

    if (deleteResult.rowCount === 0) {
      throw new AppError("Video response not found", 404);
    }

    // Delete file from filesystem
    if (videoUrl) {
      try {
        await fs.unlink(videoUrl);
      } catch (error) {
        console.error("Error deleting video file:", error);
        // Don't throw error if file deletion fails
      }
    }
  }

  static async verifyCandidateOwnership(
    candidateProfileId: number,
    userId: number
  ): Promise<void> {
    const result = await query(
      "SELECT id FROM candidate_profiles WHERE id = $1 AND user_id = $2",
      [candidateProfileId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError("Candidate profile not found or access denied", 403);
    }
  }
}
