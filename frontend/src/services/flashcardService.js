import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getAllFlashcardSets = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_ALL_FLASHCAARD_SETS);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to fetch flashcards" };
  }
};

const getFlashcardsForDocument = async (docId) => {
  try {
    const response = await axiosInstance.get(API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(docId));
    return response.data.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to fetch flashcards" };
  }
};

const reviewFlashcard = async (cardId) => {
  try {
    const response = await axiosInstance.post(API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to review flashcards" };
  }
};

const toggleStar = async (cardId) => {
  try {
    const response = await axiosInstance.put(API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to toggle star of flashcards" };
  }
};

const deleteFlashcardSet = async (setId) => {
  try {
    const response = await axiosInstance.delete(API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(setId));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Fail to delete flashcard set" };
  }
};

const flashcardService = {
  getAllFlashcardSets,
  getFlashcardsForDocument,
  reviewFlashcard,
  toggleStar,
  deleteFlashcardSet,
};

export default flashcardService;
