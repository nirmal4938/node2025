const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String, // Full name of the player
      required: true,
    },
    mobile_number: {
      type: String, // Mobile number of the player
      required: false,
      unique: true,
    },
    role: {
      type: String, // Role: Batsman, Bowler, All-Rounder, Wicket-Keeper
      enum: ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"],
      default: "All-Rounder",
    },
    batting_style: {
      type: String, // Batting style: Right-Handed, Left-Handed
      enum: ["Right-Handed", "Left-Handed"],
      default: "Right-Handed",
    },
    bowling_style: {
      type: String, // Bowling style: Off Spin, Leg Spin, Fast, Medium, None
      enum: ["Off Spin", "Leg Spin", "Fast", "Medium", "None"],
      default: "Medium",
    },
    stats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      highest_score: { type: Number, default: 0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 },
      economy: { type: Number, default: 0.0 },
      strike_rate: { type: Number, default: 0.0 },
    },
    team_id: {
      type: mongoose.Schema.Types.ObjectId, // Links the player to a team
      ref: "Team",
    },
    player_image: {
      type: mongoose.Schema.Types.ObjectId, // Stores the GridFS file ID
      ref: "uploads.files",
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

module.exports = mongoose.model("Player", playerSchema);
