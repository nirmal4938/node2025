const mongoose = require("mongoose");

const overSchema = new mongoose.Schema(
  {
    match_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the match the over belongs to
      required: true,
      ref: "Match",
    },
    bowler_id: {
      type: String, // Reference to the player (bowler) who bowled the over
      required: true,
      ref: "Player",
    },
    over_number: {
      type: Number, // Number of the over (1st, 2nd, etc.)
      required: true,
    },
    balls: {
      type: [Boolean], // Array of 6 booleans representing whether each ball was legal (true) or extra (false)
      required: true,
      default: [true, true, true, true, true, true], // Default 6 valid balls
    },
    runs_conceded: {
      type: Number, // Runs conceded in the over
      required: true,
      default: 0,
    },
    wickets_taken: {
      type: Number, // Number of wickets taken in this over
      required: true,
      default: 0,
    },
    extras: {
      type: Number, // Extras in the over (no balls, wides, etc.)
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

module.exports = mongoose.model("Over", overSchema);
