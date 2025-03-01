const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      },
    ],
    toss_winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    elected_to: {
      type: String,
      enum: ["bat", "bowl"],
      default: null,
    },
    overs: {
      type: Number,
      default: 20, // Default for T20 matches
    },
    current_innings: {
      type: Number,
      default: 1,
    },
    batting_team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    bowling_team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    innings: [
      {
        inning_number: { type: Number, required: true }, // 1st, 2nd, or Super Over
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        balls: { type: Number, default: 0 }, // Used to calculate overs
        balls_data: [{ type: mongoose.Schema.Types.ObjectId, ref: "BallByBall" }], // Store ball-by-ball tracking
      },
    ],
    target: {
      type: Number,
      default: null, // Set after first innings ends
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
