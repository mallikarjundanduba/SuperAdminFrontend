/**
 * Cron Job Service - Manual trigger for daily quiz and trending skills generation
 * Note: These endpoints are in CandidateBackend (port 8085)
 */
import axios from 'axios';

// CandidateBackend base URL (for cron job endpoints)
const CANDIDATE_BACKEND_URL = import.meta.env.VITE_CANDIDATE_BACKEND_URL || 'http://localhost:8085';

const candidateBackendClient = axios.create({
  baseURL: CANDIDATE_BACKEND_URL,
  timeout: 120000, // 2 minutes timeout for AI generation
  withCredentials: true,
});

export const cronJobService = {
  /**
   * Manually trigger daily quiz generation
   * @returns {Promise<Object>} { success: boolean, message: string, quizDate: string, questionsCount: number }
   */
  generateDailyQuiz: async () => {
    const response = await candidateBackendClient.post("/api/daily-quiz/admin/generate");
    return response.data;
  },

  /**
   * Manually trigger trending skills generation
   * @returns {Promise<Object>} { success: boolean, message: string, skillsDate: string, itSkillsCount: number, nonItSkillsCount: number }
   */
  generateTrendingSkills: async () => {
    const response = await candidateBackendClient.post("/api/trending-skills/admin/generate");
    return response.data;
  },
};
