import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller";
import { authenticateToken, requireRole, optionalAuth } from "../middleware/auth";
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

// Unauthenticated profile creation (for onboarding)
router.post(
  "/profile",
  validate(candidateSchemas.createProfileUnauthenticated),
  CandidateController.createProfileUnauthenticated
);

// Update profile by profile ID (before authentication)
router.put(
  "/profile/:id",
  validateParams(candidateSchemas.updateProfileById),
  validate(candidateSchemas.updateProfile),
  CandidateController.updateProfileById
);

// Complete profile (can be called during onboarding)
router.put(
  "/profile/:id/complete",
  validateParams(candidateSchemas.completeProfile),
  CandidateController.completeProfile
);

// Convert guest profile to authenticated user
router.post(
  "/profile/:id/claim",
  validateParams(candidateSchemas.claimProfile),
  validate(candidateSchemas.claimProfileBody),
  CandidateController.claimProfile
);

// Protected candidate routes (require authentication)
router.use(authenticateToken, requireRole("candidate"));

router.get("/profile/me", CandidateController.getProfile);
router.put(
  "/profile/me",
  validate(candidateSchemas.updateProfile),
  CandidateController.updateProfile
);
router.delete("/profile", CandidateController.deleteProfile);

export default router;