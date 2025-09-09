// src/routes/video.routes.ts
import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validate, validateParams } from "../middleware/validation";
import { videoSchemas } from "../validators/video.validators";

const router = Router();

// Protected routes
router.use(authenticateToken);

// Video upload endpoint
router.post(
  "/upload",
  requireRole("candidate"),
  validate(videoSchemas.uploadVideo),
  VideoController.uploadVideo
);

// Get videos for a candidate profile
router.get(
  "/candidate/:candidateProfileId",
  validateParams(videoSchemas.getVideos),
  VideoController.getVideosByCandidate
);

// Update video status
router.put(
  "/:id/status",
  validateParams(videoSchemas.updateVideoStatus),
  validate(videoSchemas.updateVideoStatusBody),
  VideoController.updateVideoStatus
);

// Delete video
router.delete(
  "/:id",
  validateParams(videoSchemas.deleteVideo),
  VideoController.deleteVideo
);

export default router;