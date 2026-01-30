import apiClient from "./apiService";
import { API_ENDPOINTS } from "../constants/api";

/**
 * Job service - handles job management API calls
 */
export const jobService = {
  /**
   * Get all jobs
   * @returns {Promise<Array>}
   */
  getAllJobs: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_ALL_JOBS);
    return response.data;
  },

  /**
   * Get job by ID
   * @param {number} id - Job ID
   * @returns {Promise<object>}
   */
  getJobById: async (id) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GET_JOB_BY_ID}/${id}`);
    return response.data;
  },

  /**
   * Create a new job
   * @param {Object} payload - {jobCode, companyName, jobTitle, skills, jd, packageAmount, links}
   * @returns {Promise<{message: string, job: object}>}
   */
  createJob: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_JOB, payload);
    return response.data;
  },

  /**
   * Update a job
   * @param {number} id - Job ID
   * @param {Object} payload - {jobCode, companyName, jobTitle, skills, jd, packageAmount, links}
   * @returns {Promise<{message: string, job: object}>}
   */
  updateJob: async (id, payload) => {
    const response = await apiClient.put(`${API_ENDPOINTS.UPDATE_JOB}/${id}`, payload);
    return response.data;
  },

  /**
   * Toggle job status (Active/Inactive)
   * @param {string} id - Job ID
   * @returns {Promise<{message: string}>}
   */
  toggleJobStatus: async (id) => {
    const response = await apiClient.patch(`${API_ENDPOINTS.GET_ALL_JOBS}/${id}/status`);
    return response.data;
  },

  /**
   * Delete a job
   * @param {number} id - Job ID
   * @returns {Promise<{message: string}>}
   */
  deleteJob: async (id) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.DELETE_JOB}/${id}`);
    return response.data;
  },

  /**
   * Upload jobs from CSV file
   * @param {File} file - CSV file
   * @returns {Promise<{message: string, count: number, jobs: Array}>}
   */
  uploadJobsFromCsv: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(API_ENDPOINTS.UPLOAD_JOBS_CSV, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
};

