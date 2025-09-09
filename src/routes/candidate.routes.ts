import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller";
import { authenticateToken, requireRole } from "../middleware/auth";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { candidateSchemas } from "../validators/candidate.validators";

const router = Router();

// Public routes (for employers to search)
router.get(
  "/search",
  validateQuery(candidateSchemas.searchProfiles),
  CandidateController.searchProfiles
);
router.get(
  "/:id",
  validateParams(candidateSchemas.getProfileById),
  CandidateController.getProfileById
);

// Protected candidate routes
router.use(authenticateToken, requireRole("candidate"));

router.post(
  "/profile",
  validate(candidateSchemas.createProfile),
  CandidateController.createProfile
);
router.get("/profile/me", CandidateController.getProfile);
router.put(
  "/profile",
  validate(candidateSchemas.updateProfile),
  CandidateController.updateProfile
);
router.delete("/profile", CandidateController.deleteProfile);

// Complete profile (can be called by API after video upload)
router.put(
  "/profile/:id/complete",
  validateParams(candidateSchemas.completeProfile),
  CandidateController.completeProfile
);

export default router;
