// controllers/playerController.js
const Player = require('../models/PlayerModel');
const QRCode = require('qrcode');

/**
 * Create a new player, upload player image and generate a QR code for their profile.
 */

const getAll = async (req, res) => {
  try {
    // Get query parameters for filtering, sorting, offset, and limit
    const { filter, sort, offset = 0, limit = 100 } = req.query;

    // Create a query object for filtering based on the filter param
    const query = filter ? { name: new RegExp(filter, "i") } : {};

    // Set up aggregation pipeline
    const aggregationPipeline = [
      {
        $lookup: {
          from: "teams",  // Lookup from teams collection
          localField: "team_id",  // Local field in players
          foreignField: "_id",  // Foreign field in teams
          as: "team",  // The result will be added under "team"
        },
      },
      {
        $unwind: {
          path: "$team",  // Unwind the team array to get team details
          preserveNullAndEmptyArrays: true,  // Keep players without a team
        },
      },
      {
        $match: query,  // Apply the filter query if provided
      },
      {
        $project: {
          _id: 1,
          name: 1,
          mobile_number: 1,
          role: 1,
          batting_style: 1,
          bowling_style: 1,
          stats: 1,
          player_image: 1,
          createdAt: 1,
          updatedAt: 1,
          team: { id: "$team._id", name: "$team.name" },
        },
      },
      {
        $sort: { [sort || "createdAt"]: -1 },  // Apply sorting (default is by createdAt)
      },
      {
        $skip: parseInt(offset),  // Skip the records based on the offset
      },
      {
        $limit: parseInt(limit),  // Limit the number of records
      },
    ];

    // Perform the aggregation query
    const players = await Player.aggregate(aggregationPipeline);

    // Count the total number of players based on the query (excluding pagination)
    const count = await Player.countDocuments(query);

    // Return the fetched data with count and pagination
    return res.status(200).json({
      rows: players,
      count,
    });
  } catch (error) {
    console.error("Error fetching players:", error.message);
    res.status(500).json({
      message: "Error fetching players",
      error: error.message,
    });
  }
};

// const createPlayer = async (req, res) => {
//     try {
//       let playersString = req.body.players;  // Get players as string

//       // Remove extra quotes (first and last characters)
//       if (playersString.startsWith('"') && playersString.endsWith('"')) {
//           playersString = playersString.slice(1, -1);
//       }
//       playersString = playersString.replace(/\\"/g, '"');

//       // Now parse it into JSON
//       const players = JSON.parse(playersString);
//       console.log("_players", players)
//       // const { name, mobile_number, role, batting_style, bowling_style, team_id } = req.body;
      
//       // // Check if file is uploaded
//       // const playerImageId = req.file ? req.file.id : null;
  
//       // // Create new player document
//       // const newPlayer = new Player({
//       //   name,
//       //   mobile_number,
//       //   role,
//       //   batting_style,
//       //   bowling_style,
//       //   team_id,
//       //   player_image: playerImageId,
//       // });
  
//       // await newPlayer.save();
  
//       res.status(201).json({ message: "Player created successfully",  });
//     } catch (error) {
//       console.error("Error creating player:", error);
//       res.status(500).json({ error: "Failed to create player" });
//     }
//   };

const createPlayer = async (req, res) => {
  try {
      let playersData = req.body.players; // Get players data

      // Ensure `playersData` is a valid array
      if (typeof playersData === "string") {
          try {
              playersData = JSON.parse(playersData.replace(/\\"/g, '"'));
          } catch (error) {
              return res.status(400).json({ error: "Invalid JSON format for players" });
          }
      }

      if (!Array.isArray(playersData) || playersData.length === 0) {
          return res.status(400).json({ error: "Players array is required" });
      }

      // Check if files were uploaded (assumes multer's `.array('player_images')`)
      const uploadedFiles = req.files || [];

      // Map each player to an object including image if available
      const newPlayers = playersData.map((player, index) => ({
          name: player.name?.trim(),
          mobile_number: player.mobile_number || null,
          role: player.role,
          batting_style: player.batting_style,
          bowling_style: player.bowling_style ,
          team_id: player.team_id || null,
          player_image: uploadedFiles[index] ? uploadedFiles[index].id : null, // Assign image ID if available
      }));

      // Save all players in one go
      const savedPlayers = await Player.insertMany(newPlayers);

      res.status(201).json({ message: "Players created successfully", players: savedPlayers });
  } catch (error) {
      console.error("Error creating players:", error);
      res.status(500).json({ error: "Failed to create players" });
  }
};
  


// const { name, email, phone } = req.body;
// try {
//     if (!name || !email) {
//         return res.status(400).json({ error: 'Name and email are required.' });
//     }

//     // Check if player already exists
//     const existingPlayer = await Player.findOne({ email });
//     if (existingPlayer) {
//         return res.status(400).json({ error: 'Player already exists with this email.' });
//     }
//     console.log("!!!", req.file)
//     // Create a new player object
//     const newPlayerData = {
//         name,
//         email,
//         phone,
//         player_image: req.file ? req.file.id : null,  // Store GridFS file ID for the player image
//     };

//     // Create the player instance
//     const newPlayer = new Player(newPlayerData);

//     // Generate a QR code for the player
//     const qrData = JSON.stringify({ player_id: newPlayer._id, name: newPlayer.name });
//     const qrCodeURL = await QRCode.toDataURL(qrData);
//     newPlayer.qr_code_url = qrCodeURL;

//     // Save the player
//     await newPlayer.save();

//     res.status(201).json({
//         message: 'Player created successfully.',
//         player: newPlayer,
//     });
// } catch (error) {
//     console.error('Error creating player:', error);
//     res.status(500).json({ error: 'An error occurred while creating the player.' });
// }

module.exports = { createPlayer,getAll };
