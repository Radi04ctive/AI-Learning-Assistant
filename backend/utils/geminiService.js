import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set in the enviroment variables");
  process.exit(1);
}

/**
 * Generate quiz from text
 * @param {string} text - Document text
 * @param {number} count - Number of questions
 * @returns {Promise<Array<{question: string, options: Array<string>, correctAnswer: string, explanation: string, difficullty: string}>>}
 */
export const generateQuiz = async (text, count = 5) => {
  const prompt = `Generate exactly ${count} multiple-choice questions from the following text.
    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [brief explanation of the answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each question with: "---"

    Text:
    ${text.substring(0, 15000)}`;

  try {
    const response = await client.models.generateContent({
      model: "gemma-4-31b-it",
      contents: prompt,
    });

    const generatedText = response.text;

    // parse the response
    const questions = [];
    const questionBlocks = generatedText.split("---").filter((c) => c.trim());

    for (const block of questionBlocks) {
      const lines = block
        .trim()
        .split("\n")
        .map((l) => l.trim());
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("C:")) {
          correctAnswer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        } else if (line.startsWith('O')) {
          options.push(line.substring(3).trim());
        } else if (line.startsWith("E:")) {
          explanation = line.substring(2).trim();
        }
      }

      if (question && correctAnswer && options.length === 4) {
        questions.push({ question, options, correctAnswer, explanation, difficulty });
      }
    }

    return questions.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 5) => {
  const prompt = `Generate exactly ${count} flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each flashcard with: "---"

    Text:
    ${text.substring(0, 15000)}`;

  try {
    const response = await client.models.generateContent({
      model: "gemma-4-31b-it",
      contents: prompt,
    });

    const generatedText = response.text;

    // parse the response
    const flashcardsSet = [];
    const flashcards = generatedText.split("---").filter((q) => q.trim());

    for (const flashcard of flashcards) {
      const lines = flashcard.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcardsSet.push({ question, answer, difficulty });
      }
    }

    return flashcardsSet.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>} - Summary of the document
 */
export const generateSummary = async (text) => {
  const prompt = `provide a concise summary of the following text, highlight the key concepts, main ideas, and important points.
  Keep the summary clear and structured.

  Text:
  ${text.substring(0, 15000)}`;

  try {
    const response = await client.models.generateContent({
      model: "gemma-4-31b-it",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context
 * @param {sttring} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks.map((c, i) => `[Chunck ${i + 1}]\n${c.content}`).join("\n\n");

  const prompt = `Based on following contxt from a document, analyse the context and answer the user quesstion.
    If the answer is not in the context, say so.

    Context:
    ${context}

    Question: ${question}

    Answer:`;

  try {
    const response = await client.models.generateContent({
      model: "gemma-4-31b-it",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to answer question");
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>} - Explanation of the concept
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the ${concept} concept in a clear and concise manner, using the provided context to support your explanation. 
  If the concept is not covered in the context, say so.

  Context:
  ${context.substring(0, 10000)}`;

  try {
    const response = await client.models.generateContent({
      model: "gemma-4-31b-it",
      contents: prompt,
    });

    const generatedText = response.text;
    return generatedText.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};
