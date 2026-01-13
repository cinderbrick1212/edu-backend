const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Create Quiz (Teacher only)
exports.createQuiz = async (req, res) => {
  const { title, description, questions, timeLimit } = req.body;

  // Calculate total marks
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const quiz = new Quiz({
    title,
    description,
    questions,
    timeLimit,
    totalMarks,
    createdBy: req.userId,
  });

  await quiz.save();
  res.status(201).json({ success: true, quiz });
};

// Get All Quizzes
exports.getQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ isPublished: true }).populate('createdBy', 'profile.name');
  res.status(200).json({ success: true, quizzes });
};

// Submit Quiz Attempt (Auto-grade MCQs)
exports.submitQuizAttempt = async (req, res) => {
  const { quizId, answers } = req.body; // answers = [{questionId, userAnswer}, ...]

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(404).json({ success: false, error: 'Quiz not found' });
  }

  let totalScore = 0;
  const gradedAnswers = answers.map((ans) => {
    const question = quiz.questions.find((q) => q._id.toString() === ans.questionId);
    const isCorrect = question.correctAnswer === ans.userAnswer;
    const marksObtained = isCorrect ? question.marks : 0;

    totalScore += marksObtained;

    return {
      questionId: ans.questionId,
      userAnswer: ans.userAnswer,
      isCorrect,
      marksObtained,
    };
  });

  const percentage = (totalScore / quiz.totalMarks) * 100;

  const attempt = new QuizAttempt({
    quizId,
    userId: req.userId,
    answers: gradedAnswers,
    totalScore,
    percentage,
  });

  await attempt.save();

  res.status(201).json({
    success: true,
    attempt: {
      score: totalScore,
      totalMarks: quiz.totalMarks,
      percentage: percentage.toFixed(2),
      answers: gradedAnswers,
    },
  });
};

// Get User's Quiz Attempts
exports.getUserAttempts = async (req, res) => {
  const attempts = await QuizAttempt.find({ userId: req.userId })
    .populate('quizId', 'title totalMarks')
    .sort({ attemptedAt: -1 });

  res.status(200).json({ success: true, attempts });
};
