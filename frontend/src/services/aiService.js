import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const generateFlashcards = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, {
      documentId,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to generate flashcards" };
  }
};

const generateQuiz = async (documentId, options) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, {
      documentId,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to generate quiz" };
  }
};

const generateSummary = async (documentId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, {
      documentId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to generate flashcards" };
  }
};

const chat = async (documentId, question) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.CHAT, {
      documentId,
      question,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Chat request failed" };
  }
};

const explainConcept = async (documentId, concept) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, {
      documentId,
      concept,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to explain concept" };
  }
};

const getChatHistory = async (documentId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORRY, {
      documentId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to explain concept" };
  }
};

const aiService = {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  explainConcept,
  chat,
  getChatHistory,
};

export default aiService;
