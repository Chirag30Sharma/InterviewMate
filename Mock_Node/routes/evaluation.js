const express = require('express');
const router = express.Router();
const Evaluation = require('../schemas/history');

router.post('/save-evaluation', async (req, res) => {
  try {
    const { evaluation } = req.body;
    const userEmail = req.body.userEmail; // You'll need to send this from the frontend

    const newEvaluation = new Evaluation({
      userEmail,
      average_score: evaluation.average_score,
      interview_duration: evaluation.interview_duration,
      total_questions: evaluation.total_questions,
      qa_pairs: evaluation.qa_pairs,
      detailed_evaluation: evaluation.detailed_evaluation
    });

    await newEvaluation.save();
    res.status(201).json({ message: 'Evaluation saved successfully', evaluation: newEvaluation });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    res.status(500).json({ message: 'Error saving evaluation', error: error.message });
  }
});

// Get evaluations for a specific user
router.get('/user-evaluations/:email', async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ userEmail: req.params.email })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ message: 'Error fetching evaluations', error: error.message });
  }
});

module.exports = router;
