import { Request } from "express";

// User Types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  user_type: "candidate" | "employer";
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
  user_type: "candidate" | "employer";
}

export interface RegisterRequest extends LoginRequest {
  full_name: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  userType: "candidate" | "employer";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Candidate Types
export interface CandidateProfile {
  id: number;
  user_id: number;
  full_name: string;
  location: string;
  has_work_authorization: boolean;
  languages: string[];
  years_experience: number;
  target_job_titles: string[];
  preferred_industries: string[];
  working_model: "remote" | "hybrid" | "onsite";
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  is_willing_to_relocate: boolean;
  skills: Skill[];
  achievements: string;
  has_consented_ai_analysis: boolean;
  is_profile_complete: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Skill {
  name: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert";
}

// Company Types
export interface Company {
  id: number;
  user_id: number;
  company_name: string;
  industry: string;
  company_size: string;
  location: string;
  website: string;
  description: string;
  company_values: string[];
  work_culture: string;
  has_video_intro: boolean;
  video_intro_url: string | null;
  created_at: Date;
  updated_at: Date;
}

// Job Types
export interface JobPosting {
  id: number;
  company_id: number;
  job_title: string;
  department: string;
  employment_type: "full-time" | "part-time" | "contract" | "internship";
  working_model: "remote" | "hybrid" | "onsite";
  location: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  experience_level: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Application Types
export interface JobApplication {
  id: number;
  job_posting_id: number;
  candidate_profile_id: number;
  status:
    | "pending"
    | "employer_interested"
    | "candidate_interested"
    | "mutual_interest"
    | "interview_scheduled"
    | "hired"
    | "rejected";
  employer_notes: string | null;
  candidate_notes: string | null;
  applied_at: Date;
  updated_at: Date;
}

// Video Types
export interface VideoResponse {
  id: number;
  candidate_profile_id: number;
  question_text: string;
  video_url: string | null;
  duration_seconds: number;
  status: "pending" | "ready" | "processing" | "failed";
  response_order: number;
  created_at: Date;
  updated_at: Date;
}

// AI Matching Types
export interface AIMatchScore {
  id: number;
  job_posting_id: number;
  candidate_profile_id: number;
  overall_score: number;
  skills_score: number;
  experience_score: number;
  culture_score: number;
  video_score: number;
  is_recommended: boolean;
  calculated_at: Date;
}

// Message Types
export interface Conversation {
  id: number;
  candidate_id: number;
  employer_id: number;
  job_posting_id: number | null;
  last_message_at: Date | null;
  created_at: Date;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_text: string;
  is_read: boolean;
  created_at: Date;
}

// Notification Types
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_id: number | null;
  related_type: string | null;
  is_read: boolean;
  created_at: Date;
}

// File Types
export interface UploadedFile {
  id: number;
  user_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: "resume" | "avatar" | "company_logo" | "document";
  is_active: boolean;
  created_at: Date;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request Types
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface SearchQuery extends PaginationQuery {
  q?: string;
  filters?: Record<string, any>;
}
