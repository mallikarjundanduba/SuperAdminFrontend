import apiClient from "./apiService";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Candidate service - handles candidate management API calls
 */
export const candidateService = {
  /**
   * Get all candidates
   * @returns {Promise<Array>}
   */
  getAllCandidates: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_ALL_CANDIDATES);
    return response.data;
  },

  /**
   * Create candidate invitation
   * @param {string} email - Candidate email
   * @returns {Promise<{message: string, candidate: object}>}
   */
  createCandidateInvitation: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_CANDIDATE_INVITATION, { email });
    return response.data;
  },

  /**
   * Create candidate invitation by SuperAdmin
   * @param {string} email - Candidate email
   * @returns {Promise<{message: string, candidate: object}>}
   */
  inviteCandidateBySuperAdmin: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_SUPERADMIN_CANDIDATE_INVITATION, { email });
    return response.data;
  },

  /**
   * Get candidate by email
   * @param {string} email - Candidate email
   * @returns {Promise<object>}
   */
  getCandidateByEmail: async (email) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GET_CANDIDATE_BY_EMAIL}/${email}`);
    return response.data;
  },

  /**
   * Resend candidate invitation
   * @param {string} candidateId - Candidate ID
   * @returns {Promise<{message: string}>}
   */
  resendInvite: async (candidateId) => {
    const response = await apiClient.post(API_ENDPOINTS.RESEND_INVITE, { candidateId });
    return response.data;
  }
};

