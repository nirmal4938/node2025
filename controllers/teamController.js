const Team = require('../models/TeamModel');
const Player = require('../models/PlayerModel'); // Assuming there's a Player model
const QRCode = require('qrcode'); // For QR Code generation
const mongoose = require("mongoose");
const createTeam = async (req, res) => {
  try {
    const { name, city, team_contact_number } = req.body;
    // Automatically generate short_name as the first 3 characters of the name, uppercased
    const short_name = name.substring(0, 3).toUpperCase();
    // Create a new team object
    const newTeam = new Team({
      name,
      short_name,
      city,
      team_contact_number,
    });

    // Save the team to the database
    await newTeam.save();

    console.log("Team added successfully!");
    return res.status(201).json({
      message: "Team added successfully!",
      team: newTeam,
    });
  } catch (err) {
    console.error("Error adding team:", err.message);

    // Handle specific validation or duplicate key errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.errors,
      });
    } else if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate key error",
        details: err.keyValue,
      });
    }

    // Catch-all for other errors
    return res.status(500).json({
      message: "An error occurred while adding the team",
      error: err.message,
    });
  }
};
const getAll = async (req, res) => {
  try {
    // Fetch all teams from the database
    const { filter, sort, offset = 0, limit = 10 } = req.query;

    // Create a query object
    const query = filter ? { name: new RegExp(filter, "i") } : {};
    const options = {
      sort: sort || { createdAt: -1 },
      skip: parseInt(offset),
      limit: parseInt(limit),
    };

    const teams = await Team.find(query, null, options).populate("players");

    // Return the list of teams with a count
    const count = await Team.countDocuments(query);

    return res.status(200).json({
      rows: teams,
      count,
    });
  } catch (err) {
    console.error("Error fetching teams:", err.message);

    return res.status(500).json({
      message: "An error occurred while fetching the teams",
      error: err.message,
    });
  }
};

const assignPlayersToTeam = async (req, res) => {
  const { playerIds, teamId } = req.body; // Extract player IDs and team ID from request body

  if (!Array.isArray(playerIds) || !teamId) {
    return res.status(400).json({ message: "Invalid input data. Ensure playerIds is an array and teamId is provided." });
  }

  const session = await mongoose.startSession(); // Start a session for the transaction
  session.startTransaction();

  try {
    // Validate new team
    const newTeam = await Team.findById(teamId).session(session);
    if (!newTeam) {
      throw new Error("Team not found");
    }

    // Validate players
    const players = await Player.find({ _id: { $in: playerIds } }).session(session);
    if (players.length !== playerIds.length) {
      return res.status(400).json({ message: "One or more players not found" });
    }

    // Find players who already belong to a different team
    const playersWithTeams = players.filter(player => player.team_id);
    const oldTeamIds = [...new Set(playersWithTeams.map(player => player.team_id.toString()))];

    // Remove players from their old teams
    await Team.updateMany(
      { _id: { $in: oldTeamIds } },
      { $pull: { players: { $in: playerIds } } }, // Remove these players from old teams' players array
      { session }
    );

    // Ensure the new team doesn't exceed the player limit
    // if (newTeam.players.length + playerIds.length > 11) {
    //   return res.status(400).json({ message: "The team already has 11 players. Cannot add more." });
    // }

    // Assign players to the new team
    newTeam.players = [...new Set([...newTeam.players, ...playerIds])];
    await newTeam.save({ session });

    // Update players' `team_id`
    await Player.updateMany(
      { _id: { $in: playerIds } },
      { $set: { team_id: teamId } },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json({ message: `${playerIds.length} players assigned to the team successfully.` });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in assigning players:", error.message);
    res.status(500).json({ message: "Error assigning players to the team", error: error.message });
  } finally {
    session.endSession();
  }
};


const getAllTeams = async () => {
  try {
    const teams = await Team.find().lean();
    console.log("All Teams:", teams);
  } catch (err) {
    console.error("Error fetching teams:", err.message);
  }
};



  const getPlayersInTeam = async (teamId) => {
    try {
      const players = await Player.find({ team_id: teamId }).lean();
      console.log("Players in Team:", players);
    } catch (err) {
      console.error("Error fetching players:", err.message);
    }
  };


  const updateTeamInfo = async (teamId, updates) => {
    try {
      const updatedTeam = await Team.findByIdAndUpdate(teamId, updates, { new: true });
      console.log("Updated Team Info:", updatedTeam);
    } catch (err) {
      console.error("Error updating team:", err.message);
    }
  };


  const updatePlayerInfo = async (playerId, updates) => {
    try {
      const updatedPlayer = await Player.findByIdAndUpdate(playerId, updates, { new: true });
      console.log("Updated Player Info:", updatedPlayer);
    } catch (err) {
      console.error("Error updating player:", err.message);
    }
  };


  const removePlayer = async (playerId) => {
    try {
      const player = await Player.findById(playerId);
      if (!player) throw new Error("Player not found!");
  
      const teamId = player.team_id;
  
      // Delete player from players collection
      await Player.findByIdAndDelete(playerId);
  
      // Remove player reference from the team's players array
      await Team.findByIdAndUpdate(teamId, {
        $pull: { players: { _id: playerId } },
      });
  
      console.log("Player removed successfully!");
    } catch (err) {
      console.error("Error removing player:", err.message);
    }
  };



  const removeTeam = async (teamId) => {
    try {
      // Delete all players in the team
      await Player.deleteMany({ team_id: teamId });
  
      // Delete the team itself
      await Team.findByIdAndDelete(teamId);
  
      console.log("Team and associated players removed successfully!");
    } catch (err) {
      console.error("Error removing team:", err.message);
    }
  };


  const getTeamWithPlayers = async (teamId) => {
    try {
      const team = await Team.findById(teamId)
        .populate("players._id", "name role stats") // Populate specific fields from the Player model
        .lean();
      console.log("Team with Players:", team);
    } catch (err) {
      console.error("Error fetching team with players:", err.message);
    }
  };


  const searchPlayersByName = async (query) => {
    try {
      const players = await Player.find({
        name: { $regex: query, $options: "i" }, // Case-insensitive regex
      }).lean();
      console.log("Search Results:", players);
    } catch (err) {
      console.error("Error searching players:", err.message);
    }
  };



module.exports = {createTeam, assignPlayersToTeam, getAll}