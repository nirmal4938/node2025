const Question = require('../models/QuestionModel'); // Import the Question model

/**
 * @desc Create single or multiple questions
 * @route POST /api/questions
 * @access Public
 */
const createQuestion = async (req, res) => {
  try {
    console.log("body", req.body);
    const questions = req.body; // Expecting an array of questions or a single question object
    const user = req.user;
    let created_by = user.userId
    // Check if the input is an array
    if (Array.isArray(questions)) {
        const _questions = questions.map((question) => ({
            ...question,
            created_by,
          }));
      // Bulk create questions
      const createdQuestions = await Question.insertMany(_questions);
      return res.status(201).json({
        message: `${createdQuestions.length} questions created successfully.`,
        data: createdQuestions,
      });
    } else if (typeof questions === 'object' && questions !== null) {
        questions.created_by = created_by;
        // Single question creation
      const createdQuestion = await Question.create(questions);
      return res.status(201).json({
        message: 'Question created successfully.',
        data: createdQuestion,
      });
    } else {
      return res.status(400).json({
        message: 'Invalid input format. Please provide a question object or an array of questions.',
      });
    }
  } catch (error) {
    console.error('Error creating question(s):', error.message);
    res.status(500).json({
      message: 'An error occurred while creating the question(s).',
      error: error.message,
    });
  }
};

module.exports = {createQuestion}