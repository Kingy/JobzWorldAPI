import { Request, Response } from "express";
import { CandidateService } from "../services/candidate.service";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export class CandidateController {
  // Unauthenticated profile creation for onboarding
  static createProfileUnauthenticated = asyncHandler(
    async (req: Request, res: Response) => {
      const profileData = req.body;

      const profile = await CandidateService.createProfileUnauthenticated(profileData);

      res.status(201).json({
        success: true,
        data: profile,
        message: "Candidate profile created successfully",
      });
    }
  );

  // Update profile by ID (for onboarding flow)
  static updateProfileById = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const updates = req.body;

      const profile = await CandidateService.updateProfile(
        parseInt(id),
        updates
      );

      res.json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    }
  );

  // Claim a guest profile and create user account
  static claimProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, password, full_name } = req.body;

    const result = await CandidateService.claimProfile(
      parseInt(id),
      email,
      password,
      full_name
    );

    res.json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
        profile: result.profile,
      },
      message: "Profile claimed and account created successfully",
    });
  });

  // Existing authenticated methods
  static createProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id;
      const profileData = req.body;

      const profile = await CandidateService.createProfile(userId, profileData);

      res.status(201).json({
        success: true,
        data: profile,
        message: "Candidate profile created successfully",
      });
    }
  );

  static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const profile = await CandidateService.getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    res.json({
      success: true,
      data: profile,
      message: "Profile retrieved successfully",
    });
  });

  static getProfileById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const profile = await CandidateService.getProfileById(parseInt(id));

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
      });
    }

    res.json({
      success: true,
      data: profile,
      message: "Profile retrieved successfully",
    });
  });

  static updateProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id;
      const updates = req.body;

      // First get the profile to ensure it belongs to the user
      const existingProfile = await CandidateService.getProfileByUserId(userId);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          message: "Candidate profile not found",
        });
      }

      const profile = await CandidateService.updateProfile(
        existingProfile.id,
        updates
      );

      res.json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    }
  );

  static completeProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await CandidateService.completeProfile(parseInt(id));

    res.json({
      success: true,
      message: "Profile marked as complete",
    });
  });

  static searchProfiles = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as any;

    // Parse array parameters
    if (filters.skills && typeof filters.skills === "string") {
      filters.skills = filters.skills.split(",");
    }
    if (filters.languages && typeof filters.languages === "string") {
      filters.languages = filters.languages.split(",");
    }
    if (filters.industries && typeof filters.industries === "string") {
      filters.industries = filters.industries.split(",");
    }

    // Parse numeric parameters
    if (filters.experience_min)
      filters.experience_min = parseInt(filters.experience_min);
    if (filters.experience_max)
      filters.experience_max = parseInt(filters.experience_max);
    if (filters.salary_min) filters.salary_min = parseInt(filters.salary_min);
    if (filters.salary_max) filters.salary_max = parseInt(filters.salary_max);
    if (filters.page) filters.page = parseInt(filters.page);
    if (filters.limit) filters.limit = parseInt(filters.limit);

    const result = await CandidateService.searchProfiles(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: "Profiles retrieved successfully",
    });
  });

  static deleteProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id;

      // Get the profile to ensure it belongs to the user
      const profile = await CandidateService.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Candidate profile not found",
        });
      }

      await CandidateService.deleteProfile(profile.id);

      res.json({
        success: true,
        message: "Profile deleted successfully",
      });
    }
  );
}