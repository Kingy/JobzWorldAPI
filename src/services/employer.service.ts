import { query } from "../database/connection";
import { Company, JobPosting, PaginatedResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import { AuthService } from "./auth.service";

export class EmployerService {
  // Create company profile without user authentication (for onboarding)
  static async createCompanyUnauthenticated(
    companyData: Partial<Company>
  ): Promise<Company> {
    const {
      company_name,
      industry,
      company_size,
      location,
      website,
      description,
      company_values,
      work_culture,
      has_video_intro,
      video_intro_url,
    } = companyData;

    // Create company with null user_id (guest company)
    const result = await query(
      `INSERT INTO companies (
        user_id, company_name, industry, company_size, location, website,
        description, company_values, work_culture, has_video_intro, video_intro_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        null, // user_id is null for guest companies
        company_name,
        industry,
        company_size,
        location,
        website,
        description || "",
        JSON.stringify(company_values || []),
        work_culture || "",
        has_video_intro || false,
        video_intro_url || null,
      ]
    );

    return this.parseCompany(result.rows[0]);
  }

  // Claim a guest company profile and create user account
  static async claimCompany(
    companyId: number,
    email: string,
    password: string,
    full_name: string
  ): Promise<{
    user: any;
    tokens: any;
    company: Company;
  }> {
    // Check if company exists and is unclaimed
    const companyResult = await query(
      "SELECT * FROM companies WHERE id = $1 AND user_id IS NULL",
      [companyId]
    );

    if (companyResult.rows.length === 0) {
      throw new AppError("Company not found or already claimed", 404);
    }

    // Register the user
    const authResult = await AuthService.register({
      email,
      password,
      user_type: "employer",
      full_name,
    });

    // Link the company to the new user
    const updatedCompanyResult = await query(
      "UPDATE companies SET user_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [authResult.user.id, companyId]
    );

    return {
      user: authResult.user,
      tokens: authResult.tokens,
      company: this.parseCompany(updatedCompanyResult.rows[0]),
    };
  }

  // Create job posting for unauthenticated company
  static async createJobForCompany(
    companyId: number,
    jobData: Partial<JobPosting>
  ): Promise<JobPosting> {
    const {
      job_title,
      department,
      employment_type,
      working_model,
      location,
      salary_min,
      salary_max,
      salary_currency,
      experience_level,
      requirements,
      responsibilities,
      benefits,
    } = jobData;

    const result = await query(
      `INSERT INTO job_postings (
        company_id, job_title, department, employment_type, working_model,
        location, salary_min, salary_max, salary_currency, experience_level,
        requirements, responsibilities, benefits, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, FALSE)
      RETURNING *`,
      [
        companyId,
        job_title,
        department,
        employment_type || "full-time",
        working_model || "remote",
        location,
        salary_min,
        salary_max,
        salary_currency || "USD",
        experience_level,
        JSON.stringify(requirements || []),
        JSON.stringify(responsibilities || []),
        JSON.stringify(benefits || []),
      ]
    );

    return this.parseJobPosting(result.rows[0]);
  }

  // Publish company profile and activate job postings
  static async publishCompany(companyId: number): Promise<void> {
    // Activate all job postings for this company
    await query(
      "UPDATE job_postings SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE company_id = $1",
      [companyId]
    );
  }

  // Existing authenticated methods
  static async createCompany(
    userId: number,
    companyData: Partial<Company>
  ): Promise<Company> {
    const {
      company_name,
      industry,
      company_size,
      location,
      website,
      description,
      company_values,
      work_culture,
      has_video_intro,
      video_intro_url,
    } = companyData;

    const result = await query(
      `INSERT INTO companies (
        user_id, company_name, industry, company_size, location, website,
        description, company_values, work_culture, has_video_intro, video_intro_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        company_name,
        industry,
        company_size,
        location,
        website,
        description || "",
        JSON.stringify(company_values || []),
        work_culture || "",
        has_video_intro || false,
        video_intro_url || null,
      ]
    );

    return this.parseCompany(result.rows[0]);
  }

  static async getCompanyByUserId(userId: number): Promise<Company | null> {
    const result = await query(
      "SELECT * FROM companies WHERE user_id = $1",
      [userId]
    );

    return result.rows[0] ? this.parseCompany(result.rows[0]) : null;
  }

  static async getCompanyById(id: number): Promise<Company | null> {
    const result = await query("SELECT * FROM companies WHERE id = $1", [id]);

    return result.rows[0] ? this.parseCompany(result.rows[0]) : null;
  }

  static async updateCompany(
    id: number,
    updates: Partial<Company>
  ): Promise<Company> {
    const allowedFields = [
      "company_name",
      "industry",
      "company_size",
      "location",
      "website",
      "description",
      "company_values",
      "work_culture",
      "has_video_intro",
      "video_intro_url",
    ];

    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    // Process JSON fields
    const processedUpdates: any = { ...updates };
    if (updates.company_values)
      processedUpdates.company_values = JSON.stringify(updates.company_values);

    const setClause = updateFields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    const values = updateFields.map((field) => processedUpdates[field]);

    const result = await query(
      `UPDATE companies 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      throw new AppError("Company not found", 404);
    }

    return this.parseCompany(result.rows[0]);
  }

  static async deleteCompany(id: number): Promise<void> {
    const result = await query("DELETE FROM companies WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      throw new AppError("Company not found", 404);
    }
  }

  static async searchCompanies(filters: {
    industries?: string[];
    company_size?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Company>> {
    const { industries, company_size, location, page = 1, limit = 20 } = filters;

    const offset = (page - 1) * limit;
    let whereClause = "WHERE user_id IS NOT NULL"; // Only show claimed companies
    const whereParams: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (industries && industries.length > 0) {
      whereClause += ` AND industry = ANY($${paramIndex++})`;
      whereParams.push(industries);
    }

    if (company_size) {
      whereClause += ` AND company_size = $${paramIndex++}`;
      whereParams.push(company_size);
    }

    if (location) {
      whereClause += ` AND location ILIKE $${paramIndex++}`;
      whereParams.push(`%${location}%`);
    }

    // Get companies
    const companiesResult = await query(
      `SELECT * FROM companies ${whereClause} 
       ORDER BY updated_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...whereParams, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM companies ${whereClause}`,
      whereParams
    );

    const companies = companiesResult.rows.map((row: any) =>
      this.parseCompany(row)
    );
    const total = parseInt(countResult.rows[0].count);

    return {
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Job management methods
  static async getJobsByUserId(userId: number): Promise<JobPosting[]> {
    const result = await query(
      `SELECT jp.* FROM job_postings jp
       JOIN companies c ON jp.company_id = c.id
       WHERE c.user_id = $1
       ORDER BY jp.created_at DESC`,
      [userId]
    );

    return result.rows.map((row: any) => this.parseJobPosting(row));
  }

  static async getJobById(id: number): Promise<JobPosting | null> {
    const result = await query("SELECT * FROM job_postings WHERE id = $1", [
      id,
    ]);

    return result.rows[0] ? this.parseJobPosting(result.rows[0]) : null;
  }

  static async createJob(
    companyId: number,
    jobData: Partial<JobPosting>
  ): Promise<JobPosting> {
    const {
      job_title,
      department,
      employment_type,
      working_model,
      location,
      salary_min,
      salary_max,
      salary_currency,
      experience_level,
      requirements,
      responsibilities,
      benefits,
    } = jobData;

    const result = await query(
      `INSERT INTO job_postings (
        company_id, job_title, department, employment_type, working_model,
        location, salary_min, salary_max, salary_currency, experience_level,
        requirements, responsibilities, benefits, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)
      RETURNING *`,
      [
        companyId,
        job_title,
        department,
        employment_type || "full-time",
        working_model || "remote",
        location,
        salary_min,
        salary_max,
        salary_currency || "USD",
        experience_level,
        JSON.stringify(requirements || []),
        JSON.stringify(responsibilities || []),
        JSON.stringify(benefits || []),
      ]
    );

    return this.parseJobPosting(result.rows[0]);
  }

  static async updateJob(
    id: number,
    updates: Partial<JobPosting>
  ): Promise<JobPosting> {
    const allowedFields = [
      "job_title",
      "department",
      "employment_type",
      "working_model",
      "location",
      "salary_min",
      "salary_max",
      "salary_currency",
      "experience_level",
      "requirements",
      "responsibilities",
      "benefits",
      "is_active",
    ];

    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    // Process JSON fields
    const processedUpdates: any = { ...updates };
    if (updates.requirements)
      processedUpdates.requirements = JSON.stringify(updates.requirements);
    if (updates.responsibilities)
      processedUpdates.responsibilities = JSON.stringify(
        updates.responsibilities
      );
    if (updates.benefits)
      processedUpdates.benefits = JSON.stringify(updates.benefits);

    const setClause = updateFields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    const values = updateFields.map((field) => processedUpdates[field]);

    const result = await query(
      `UPDATE job_postings 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      throw new AppError("Job not found", 404);
    }

    return this.parseJobPosting(result.rows[0]);
  }

  static async deleteJob(id: number): Promise<void> {
    const result = await query("DELETE FROM job_postings WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      throw new AppError("Job not found", 404);
    }
  }

  // Helper methods
  private static parseCompany(row: any): Company {
    return {
      ...row,
      company_values:
        typeof row.company_values === "string"
          ? JSON.parse(row.company_values)
          : row.company_values,
    };
  }

  private static parseJobPosting(row: any): JobPosting {
    return {
      ...row,
      requirements:
        typeof row.requirements === "string"
          ? JSON.parse(row.requirements)
          : row.requirements,
      responsibilities:
        typeof row.responsibilities === "string"
          ? JSON.parse(row.responsibilities)
          : row.responsibilities,
      benefits:
        typeof row.benefits === "string"
          ? JSON.parse(row.benefits)
          : row.benefits,
    };
  }
}