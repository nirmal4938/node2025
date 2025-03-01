const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
    trim: true,
  },
  question_type: {
    type: String,
    enum: ['MCQ', 'TRUE_FALSE', 'SUBJECTIVE'], // Supports multiple question types
    default: 'MCQ',
  },
  options: {
   type: [ {
      text: { type: String, required: false },
      is_correct: { type: Boolean, default: false }, // Mark correct options for MCQ
    }],
  },
  correct_answer: {
    type: mongoose.Schema.Types.Mixed, // Can be a string, boolean, or other formats for subjective questions
    required: function () {
      return this.question_type !== 'SUBJECTIVE';
    },
    required: false,
  },
  explanation: {
    type: String, // Optional explanation for correct answers
  },
  difficulty_level: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'], // Useful for categorization and filtering
    default: 'MEDIUM',
  },
  tags: [
    {
      type: String, // Tags for categorization (e.g., 'Botany', 'Photosynthesis')
      trim: true,
    },
  ],
  topic: {
    type: String, // The specific topic of the question (e.g., "Plant Physiology")
    required: true,
    trim: true,
  },
  media: {
    image_url: { type: String }, // Image for the question
    video_url: { type: String }, // Video link (e.g., YouTube)
    audio_url: { type: String }, // Audio for listening comprehension
  },
  language: {
    type: String, // Language code (e.g., 'en', 'hi')
    default: 'en',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who created the question
    required: true,
  },
  is_active: {
    type: Boolean, // Marks if the question is active or archived
    default: true,
  },
  version: {
    type: Number, // Tracks version for the question
    default: 1,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update `updated_at` on save
questionSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Question', questionSchema);
