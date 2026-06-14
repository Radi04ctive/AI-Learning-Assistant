import Quiz from "../models/Quiz.js";

// @desc    Get all quizzes for a document
// @route   GET /api/quizzes/:documentId
// @access  Private
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id, documentId: req.params.documentId })
      .populate("documentId", "title filename")
      .sort({ createdAt: -1 });

    if (!quizzes) {
      return res.status(404).json({
        success: false,
        error: "quizzes not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/quiz/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
  try {
    const answers = req.body.answers;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "answers must be a array",
        statusCode: 400,
      });
    }
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "quiz not found",
        statusCode: 404,
      });
    }

    // if (quiz.completedAt) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "quiz already completed",
    //     statusCode: 400,
    //   });
    // }

    if (answers.length !== quiz.totalQuestions){
        return res.status(400).json({
        success: false,
        error: "Please answer all questions then submit",
        statusCode: 400,
      }); 
    }

    // Process user answers
    let correctCount = 0
    const userAnswers = []

    answers.forEach(answer => {
        const {questionIndex, selectedAnswer} = answer
        if(questionIndex < quiz.questions.length){
            const question = quiz.questions[questionIndex]
            const isCorrect = selectedAnswer  === question.correctAnswer
            if (isCorrect) {
                correctCount++
            }
            userAnswers.push({
                questionIndex,
                selectedAnswer,
                isCorrect
            })
        }
    })

    const score = Math.round((correctCount/quiz.totalQuestions) * 100)

    quiz.userAnswers = userAnswers
    quiz.score = score
    quiz.completedAt = new Date()

    await quiz.save()

    res.status(200).json({
        success: true,
        data: {
            quizId: quiz._id,
            score,
            correctCount,
            totalQuestions: quiz.totalQuestions,
            percentage: score,
            userAnswers
        },
        message: 'quis result submited successfully'
    })
  } catch (error) {
    next(error);
  }
};

// @desc    get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({_id: req.params.id, userId:req.user._id}).populate('documentId', 'title')

    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'quiz not found',
            statusCode: 404
        })
    }

    if (!quiz.completedAt) {
    return res.status(400).json({
        success: false,
        error: 'Quiz not completed yet',
        statusCode: 400
    })
    }

    const detailedResult = quiz.questions.map((question, index) => {
        const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index)

        return {
            questionIndex: index,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            selectedAnswer: userAnswer?.selectedAnswer || null,
            isCorrect: userAnswer?.isCorrect || false,
            explanation: question.explanation
        }
    })

    res.status(200).json({
        success: true,
        data:{
            quiz: {
                id: quiz._id,
                title: quiz.title,
                document: quiz.documentId,
                score: quiz.score,
                totalQuestions: quiz.totalQuestions,
                completedAt: quiz.completedAt
            },
            results: detailedResult
        }
    })
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
        _id: req.params.id,
        userId: req.user._id
    })

    if (!quiz) {
        return res.status(404).json({
            success: false,
            error: 'quiz not found',
            statusCode: 404
        })
    }

    await quiz.deleteOne()

    res.status(200).json({
        success: true,
        message: 'Quiz deleted successfully'
    })
  } catch (error) {
    next(error);
  }
};
