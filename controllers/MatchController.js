// const mongoose = require('mongoose')

const Match = require("../models/MatchesModel");
const mongoose = require('mongoose')
const Team = require('../models/TeamModel')

const startMatch = async (req, res) => {
  const { team1Id, team2Id } = req.body;

  if (!team1Id || !team2Id) {
    return res.status(400).json({ message: "Both teams must be provided." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate teams
    const team1 = await Team.findById(team1Id).session(session);
    const team2 = await Team.findById(team2Id).session(session);

    if (!team1 || !team2) {
      throw new Error("One or both teams not found.");
    }

    // Check if teams already have 11 players
    if (team1.players.length !== 11 || team2.players.length !== 11) {
      return res.status(400).json({ message: "Both teams must have 11 players." });
    }

    // Toss to decide who bats first
    const tossWinner = Math.random() < 0.5 ? team1Id : team2Id;
    const electedTo = Math.random() < 0.5 ? "bat" : "bowl";
    const battingTeam = electedTo === "bat" ? tossWinner : tossWinner === team1Id ? team2Id : team1Id;
    const bowlingTeam = battingTeam === team1Id ? team2Id : team1Id;

    // Create match
    const match = new Match({
      teams: [team1Id, team2Id],
      toss_winner: tossWinner,
      elected_to: electedTo,
      batting_team: battingTeam,
      bowling_team: bowlingTeam,
      status: "In Progress",
    });
    await match.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: "Match started successfully", match });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Error starting match", error: error.message });
  } finally {
    session.endSession();
  }
};

const updateMatch = async (req, res) => {
//    update match based on match id
}


// const 



  module.exports = {startMatch}