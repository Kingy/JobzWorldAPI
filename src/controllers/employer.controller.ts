import { Request, Response } from "express";
import { EmployerService } from "../services/employer.service";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthRequest } from "../types";

export class EmployerController {
  // Unauthenticated company profile creation for onboarding
  static createCompanyUnauthenticated = asyncHandler(
    async (req: Request, res: Response) => {
      const companyData = req.body;

      const company = await EmployerService.createCompanyUnauthenticated(companyData);

      res.status(201).json({
        success: true,
        data: company,
        message: "Company profile created successfully",
      });
    }
  );

  // Update company profile by ID (for onboarding flow)
  static updateCompanyById = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const updates = req.body;

      const company = await EmployerService.updateCompany(
        parseInt(id),
        updates
      );

      res.json({
        success: true,
        data: company,
        message: "Company profile updated successfully",
      });
    }
  );

  // Create job posting for unauthenticated company
  static createJobForCompany = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const jobData = req.body;

      const job = await EmployerService.createJobForCompany(
        parseInt(id),
        jobData
      );

      res.status(201).json({
        success: true,
        data: job,
        message: "Job posting created successfully",
      });
    }
  );

  // Publish company profile and activate job postings
  static publishCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await EmployerService.publishCompany(parseInt(id));

    res.json({
      success: true,
      message: "Company profile and job postings published successfully",
    });
  });

  // Claim a guest company profile and create user account
  static claimCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, password, full_name } = req.body;

    const result = await EmployerService.claimCompany(
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
        company: result.company,
      },
      message: "Company profile claimed and account created successfully",
    });
  });

  // Public routes
  static searchCompanies = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query as any;

    // Parse array parameters
    if (filters.industries && typeof filters.industries === "string") {
      filters.industries = filters.industries.split(",");
    }

    // Parse numeric parameters
    if (filters.page) filters.page = parseInt(filters.page);
    if (filters.limit) filters.limit = parseInt(filters.limit);

    const result = await EmployerService.searchCompanies(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: "Companies retrieved successfully",
    });
  });

  static getCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const company = await EmployerService.getCompanyById(parseInt(id));

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: company,
      message: "Company retrieved successfully",
    });
  });

  // Authenticated routes
  static createCompany = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id;
      const companyData = req.body;

      const company = await EmployerService.createCompany(userId, companyData);

      res.status(201).json({
        success: true,
        data: company,
        message: "Company profile created successfully",
      });
    }
  );

  static getCompany = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const company = await EmployerService.getCompanyByUserId(userId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    res.json({
      success: true,
      data: company,
      message: "Company retrieved successfully",
    });
  });

  static updateCompany = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id;
      const updates = req.body;

      // First get the company to ensure it belongs to the user
      const existingCompany = await EmployerService.getCompanyByUserId(userId);
      if (!existingCompany) {
        return res.status(404).json({
          success: false,
          message: "Company profile not found",
        });
      }

      const company = await EmployerService.updateCompany(
        existingCompany.id,
        updates
      );

      res.json({
        success: true,
        data: company,
        message: "Company updated successfully",
      });
    }
  );

  static deleteCompany = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const userId = req.user!.id;

      // Get the company to ensure it belongs to the user
      const company = await EmployerService.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company profile not found",
        });
      }

      await EmployerService.deleteCompany(company.id);

      res.json({
        success: true,
        message: "Company deleted successfully",
      });
    }
  );

  // Job management
  static getJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const jobs = await EmployerService.getJobsByUserId(userId);

    res.json({
      success: true,
      data: jobs,
      message: "Jobs retrieved successfully",
    });
  });

  static createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const jobData = req.body;

    // Get company ID
    const company = await EmployerService.getCompanyByUserId(userId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found. Please create a company profile first.",
      });
    }

    const job = await EmployerService.createJob(company.id, jobData);

    res.status(201).json({
      success: true,
      data: job,
      message: "Job created successfully",
    });
  });

  static updateJob = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const updates = req.body;

    // Verify job belongs to user's company
    const job = await EmployerService.getJobById(parseInt(id));
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const company = await EmployerService.getCompanyByUserId(userId);
    if (!company || job.company_id !== company.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updatedJob = await EmployerService.updateJob(parseInt(id), updates);

    res.json({
      success: true,
      data: updatedJob,
      message: "Job updated successfully",
    });
  });

  static deleteJob = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify job belongs to user's company
    const job = await EmployerService.getJobById(parseInt(id));
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const company = await EmployerService.getCompanyByUserId(userId);
    if (!company || job.company_id !== company.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await EmployerService.deleteJob(parseInt(id));

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  });
}