import { query } from "../database/connection";
import { CandidateProfile, Skill, PaginatedResponse } from "../types";
import { AppError } from "../middleware/errorHandler";
import { AuthService } from "./auth.service";

export class CandidateService {
  // Create profile without user authentication (for onboarding)
  static async createProfileUnauthenticated(
    profileData: Partial<CandidateProfile>
  ): Promise<CandidateProfile> {
    const {
      full_name,
      location,
      has_work_authorization,
      languages,
      years_experience,
      target_job_titles,
      preferred_industries,
      working_model,
      salary_min,
      salary_max,
      salary_currency,
      is_willing_to_relocate,
      skills,
      achievements,
      has_consented_ai_analysis,
    } = profileData;

    // Create profile with null user_id (guest profile)
    const result = await query(
      `INSERT INTO candidate_profiles (
        user_id, full_name, location, has_work_authorization, languages,
        years_experience, target_job_titles, preferred_industries, working_model,
        salary_min, salary_max, salary_currency, is_willing_to_relocate,
        skills, achievements, has_consented_ai_analysis, is_profile_complete
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, FALSE)
      RETURNING *`,
      [
        null, // user_id is null for guest profiles
        full_name,
        location,
        has_work_authorization || false,
        JSON.stringify(languages || []),
        years_experience || 0,
        JSON.stringify(target_job_titles || []),
        JSON.stringify(preferred_industries || []),
        working_model || "remote",
        salary_min,
        salary_max,
        salary_currency || "USD",
        is_willing_to_relocate || false,
        JSON.stringify(skills || []),
        achievements || "",
        has_consented_ai_analysis || false,
      ]
    );

    return this.parseProfile(result.rows[0]);
  }

  // Claim a guest profile and create user account
  static async claimProfile(
    profileId: number,
    email: string,
    password: string,
    full_name: string
  ): Promise<{
    user: any;
    tokens: any;
    profile: CandidateProfile;
  }> {
    // Check if profile exists and is unclaimed
    const profileResult = await query(
      "SELECT * FROM candidate_profiles WHERE id = $1 AND user_id IS NULL",
      [profileId]
    );

    if (profileResult.rows.length === 0) {
      throw new AppError("Profile not found or already claimed", 404);
    }

    // Register the user
    const authResult = await AuthService.register({
      email,
      password,
      user_type: "candidate",
      full_name,
    });

    // Link the profile to the new user
    const updatedProfileResult = await query(
      "UPDATE candidate_profiles SET user_id = $1, full_name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [authResult.user.id, full_name, profileId]
    );

    return {
      user: authResult.user,
      tokens: authResult.tokens,
      profile: this.parseProfile(updatedProfileResult.rows[0]),
    };
  }

  // Existing methods (unchanged)
  static async createProfile(
    userId: number,
    profileData: Partial<CandidateProfile>
  ): Promise<CandidateProfile> {
    const {
      full_name,
      location,
      has_work_authorization,
      languages,
      years_experience,
      target_job_titles,
      preferred_industries,
      working_model,
      salary_min,
      salary_max,
      salary_currency,
      is_willing_to_relocate,
      skills,
      achievements,
      has_consented_ai_analysis,
    } = profileData;

    const result = await query(
      `INSERT INTO candidate_profiles (
        user_id, full_name, location, has_work_authorization, languages,
        years_experience, target_job_titles, preferred_industries, working_model,
        salary_min, salary_max, salary_currency, is_willing_to_relocate,
        skills, achievements, has_consented_ai_analysis, is_profile_complete
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, FALSE)
      RETURNING *`,
      [
        userId,
        full_name,
        location,
        has_work_authorization || false,
        JSON.stringify(languages || []),
        years_experience || 0,
        JSON.stringify(target_job_titles || []),
        JSON.stringify(preferred_industries || []),
        working_model || "remote",
        salary_min,
        salary_max,
        salary_currency || "USD",
        is_willing_to_relocate || false,
        JSON.stringify(skills || []),
        achievements || "",
        has_consented_ai_analysis || false,
      ]
    );

    return this.parseProfile(result.rows[0]);
  }

  static async getProfileByUserId(
    userId: number
  ): Promise<CandidateProfile | null> {
    const result = await query(
      "SELECT * FROM candidate_profiles WHERE user_id = $1",
      [userId]
    );

    return result.rows[0] ? this.parseProfile(result.rows[0]) : null;
  }

  static async getProfileById(id: number): Promise<CandidateProfile | null> {
    const result = await query(
      "SELECT * FROM candidate_profiles WHERE id = $1",
      [id]
    );

    return result.rows[0] ? this.parseProfile(result.rows[0]) : null;
  }

  static async updateProfile(
    id: number,
    updates: Partial<CandidateProfile>
  ): Promise<CandidateProfile> {
    const allowedFields = [
      "full_name",
      "location",
      "has_work_authorization",
      "languages",
      "years_experience",
      "target_job_titles",
      "preferred_industries",
      "working_model",
      "salary_min",
      "salary_max",
      "salary_currency",
      "is_willing_to_relocate",
      "skills",
      "achievements",
      "has_consented_ai_analysis",
      "is_profile_complete",
    ];

    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new AppError("No valid fields to update", 400);
    }

    // Process JSON fields
    const processedUpdates: any = { ...updates };
    if (updates.languages)
      processedUpdates.languages = JSON.stringify(updates.languages);
    if (updates.target_job_titles)
      processedUpdates.target_job_titles = JSON.stringify(
        updates.target_job_titles
      );
    if (updates.preferred_industries)
      processedUpdates.preferred_industries = JSON.stringify(
        updates.preferred_industries
      );
    if (updates.skills)
      processedUpdates.skills = JSON.stringify(updates.skills);

    const setClause = updateFields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    const values = updateFields.map((field) => processedUpdates[field]);

    const result = await query(
      `UPDATE candidate_profiles 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      throw new AppError("Candidate profile not found", 404);
    }

    return this.parseProfile(result.rows[0]);
  }

  static async completeProfile(id: number): Promise<void> {
    const result = await query(
      "UPDATE candidate_profiles SET is_profile_complete = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      throw new AppError("Candidate profile not found", 404);
    }
  }

  static async searchProfiles(filters: {
    skills?: string[];
    experience_min?: number;
    experience_max?: number;
    working_model?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    languages?: string[];
    industries?: string[];
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CandidateProfile>> {
    const {
      skills,
      experience_min,
      experience_max,
      working_model,
      location,
      salary_min,
      salary_max,
      languages,
      industries,
      page = 1,
      limit = 20,
    } = filters;

    const offset = (page - 1) * limit;
    let whereClause = "WHERE is_profile_complete = TRUE AND user_id IS NOT NULL"; // Only show claimed profiles
    const whereParams: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (skills && skills.length > 0) {
      whereClause += ` AND skills::text ILIKE ANY(ARRAY[${skills
        .map(() => `$${paramIndex++}`)
        .join(", ")}])`;
      whereParams.push(...skills.map((skill) => `%"${skill}"%`));
    }

    if (experience_min !== undefined) {
      whereClause += ` AND years_experience >= $${paramIndex++}`;
      whereParams.push(experience_min);
    }

    if (experience_max !== undefined) {
      whereClause += ` AND years_experience <= $${paramIndex++}`;
      whereParams.push(experience_max);
    }

    if (working_model) {
      whereClause += ` AND working_model = $${paramIndex++}`;
      whereParams.push(working_model);
    }

    if (location) {
      whereClause += ` AND location ILIKE $${paramIndex++}`;
      whereParams.push(`%${location}%`);
    }

    if (salary_min !== undefined) {
      whereClause += ` AND salary_max >= $${paramIndex++}`;
      whereParams.push(salary_min);
    }

    if (salary_max !== undefined) {
      whereClause += ` AND salary_min <= $${paramIndex++}`;
      whereParams.push(salary_max);
    }

    if (languages && languages.length > 0) {
      whereClause += ` AND languages::text ILIKE ANY(ARRAY[${languages
        .map(() => `$${paramIndex++}`)
        .join(", ")}])`;
      whereParams.push(...languages.map((lang) => `%"${lang}"%`));
    }

    if (industries && industries.length > 0) {
      whereClause += ` AND preferred_industries::text ILIKE ANY(ARRAY[${industries
        .map(() => `$${paramIndex++}`)
        .join(", ")}])`;
      whereParams.push(...industries.map((industry) => `%"${industry}"%`));
    }

    // Get profiles
    const profilesResult = await query(
      `SELECT * FROM candidate_profiles ${whereClause} 
       ORDER BY updated_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...whereParams, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM candidate_profiles ${whereClause}`,
      whereParams
    );

    const profiles = profilesResult.rows.map((row: any) =>
      this.parseProfile(row)
    );
    const total = parseInt(countResult.rows[0].count);

    return {
      data: profiles,
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

  static async deleteProfile(id: number): Promise<void> {
    const result = await query("DELETE FROM candidate_profiles WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      throw new AppError("Candidate profile not found", 404);
    }
  }

  private static parseProfile(row: any): CandidateProfile {
    return {
      ...row,
      languages:
        typeof row.languages === "string"
          ? JSON.parse(row.languages)
          : row.languages,
      target_job_titles:
        typeof row.target_job_titles === "string"
          ? JSON.parse(row.target_job_titles)
          : row.target_job_titles,
      preferred_industries:
        typeof row.preferred_industries === "string"
          ? JSON.parse(row.preferred_industries)
          : row.preferred_industries,
      skills:
        typeof row.skills === "string" ? JSON.parse(row.skills) : row.skills,
    };
  }
}