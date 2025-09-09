import { Router } from "express";
import { EmployerController } from "../controllers/employer.controller";
import { authenticateToken, requireRole } from "../middleware/auth";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import { employerSchemas } from "../validators/employer.validators";

const router = Router();

// Public routes (for candidate search)
router.get(
  "/search",
  validateQuery(employerSchemas.searchCompanies),
  EmployerController.searchCompanies
);
router.get(
  "/:id",
  validateParams(employerSchemas.getCompanyById),
  EmployerController.getCompanyById
);

// Unauthenticated company profile creation (for onboarding)
router.post(
  "/profile",
  validate(employerSchemas.createCompanyUnauthenticated),
  EmployerController.createCompanyUnauthenticated
);

// Update company profile by ID (before authentication)
router.put(
  "/profile/:id",
  validateParams(employerSchemas.updateCompanyById),
  validate(employerSchemas.updateCompany),
  EmployerController.updateCompanyById
);

// Create job posting for unauthenticated company
router.post(
  "/profile/:id/job",
  validateParams(employerSchemas.createJobForCompany),
  validate(employerSchemas.createJob),
  EmployerController.createJobForCompany
);

// Complete company profile and publish job
router.put(
  "/profile/:id/publish",
  validateParams(employerSchemas.publishCompany),
  EmployerController.publishCompany
);

// Convert guest company profile to authenticated user
router.post(
  "/profile/:id/claim",
  validateParams(employerSchemas.claimCompany),
  validate(employerSchemas.claimCompanyBody),
  EmployerController.claimCompany
);

// Protected employer routes (require authentication)
router.use(authenticateToken, requireRole("employer"));

router.get("/profile/me", EmployerController.getCompany);
router.put(
  "/profile/me",
  validate(employerSchemas.updateCompany),
  EmployerController.updateCompany
);
router.delete("/profile", EmployerController.deleteCompany);

// Job management routes
router.get("/jobs", EmployerController.getJobs);
router.post(
  "/jobs",
  validate(employerSchemas.createJob),
  EmployerController.createJob
);
router.put(
  "/jobs/:id",
  validateParams(employerSchemas.updateJob),
  validate(employerSchemas.updateJobBody),
  EmployerController.updateJob
);
router.delete(
  "/jobs/:id",
  validateParams(employerSchemas.deleteJob),
  EmployerController.deleteJob
);

export default router;