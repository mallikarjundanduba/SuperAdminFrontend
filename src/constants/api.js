// All URLs must be set in .env file
if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not set in .env file");
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  GET_CURRENT_ADMIN: "/auth/me",

  // Admin endpoints
  GET_ALL_ADMINS: "/api/admins",
  CREATE_ADMIN: "/api/admins",
  UPDATE_ADMIN: "/api/admins",
  DELETE_ADMIN: "/api/admins",
  SEND_WELCOME: "/api/admins/send-welcome",

  // Candidate endpoints
  GET_ALL_CANDIDATES: "/api/candidates",
  CREATE_CANDIDATE_INVITATION: "/api/candidates/invite",
  CREATE_SUPERADMIN_CANDIDATE_INVITATION: "/api/candidates/superadmin/invite",
  GET_CANDIDATE_BY_EMAIL: "/api/candidates",
  RESEND_INVITE: "/api/candidates/resend-invite",

  // College endpoints
  GET_ALL_COLLEGES: "/api/colleges",
  GET_COLLEGE_BY_ID: "/api/colleges",
  CREATE_COLLEGE: "/api/colleges",
  UPDATE_COLLEGE: "/api/colleges",
  DELETE_COLLEGE: "/api/colleges",

  // Role endpoints
  GET_ALL_ROLES: "/api/roles",
  CREATE_ROLE: "/api/roles",
  UPDATE_ROLE: "/api/roles",
  GET_ROLE_BY_ID: "/api/roles",
  GET_ROLES_BY_ORGANIZATION: "/api/roles/organization",

  // Organization-specific endpoints
  GET_USERS_BY_ORGANIZATION: "/api/admins/organization",

  // Job endpoints
  GET_ALL_JOBS: "/api/jobs",
  GET_JOB_BY_ID: "/api/jobs",
  CREATE_JOB: "/api/jobs",
  UPDATE_JOB: "/api/jobs",
  DELETE_JOB: "/api/jobs",
  UPLOAD_JOBS_CSV: "/api/jobs/upload-csv",

  // Credit endpoints
  GET_CREDITS: "/api/credits",
  CREATE_CREDITS: "/api/credits",
  UPDATE_CREDITS: "/api/credits/organizations",
};

