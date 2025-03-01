const mongoose = require("mongoose");

const ballSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
  over: { type: Number, required: true }, 
  ball_number: { type: Number, required: true },  // Ball number in the over (1 to 6)
  batsman: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  runs: { type: Number, required: true, default: 0 },  // Runs scored on this ball
  wicket: { type: Boolean, default: false },  // Whether a wicket fell
  extra: { 
    type: String, 
    enum: ["none", "wide", "no_ball", "bye", "leg_bye"], 
    default: "none" 
  },  // Type of extra
  timestamp: { type: Date, default: Date.now } // Time of ball delivery
});

// Ensure unique constraint per ball per over in a match
ballSchema.index({ match_id: 1, over: 1, ball_number: 1 }, { unique: true });

const Ball = mongoose.model("Ball", ballSchema);

module.exports = Ball;
