const mongoose = require("mongoose");
const Team = require("../models/TeamModel"); // Adjust the path based on your folder structure
// const connectDB = require("./db"); // MongoDB connection file
const {connectDB} = require("../database/configDB")

const seedTeams = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing teams
    await Team.deleteMany();
    console.log("Cleared existing teams");

    // Seed data for teams
    const teams = [
      {
        name: "Team A",
        short_name: "TMA",
        players: [
          {
            _id: "player1",
            name: "Player 1",
            role: "Batsman",
            batting_style: "Right-Handed",
            bowling_style: "None",
          },
          {
            _id: "player2",
            name: "Player 2",
            role: "Bowler",
            batting_style: "Left-Handed",
            bowling_style: "Fast",
          },
          {
            _id: "player3",
            name: "Player 3",
            role: "All-Rounder",
            batting_style: "Right-Handed",
            bowling_style: "Medium",
          },
        ],
        captain: "player1",
        coach: "Coach A",
        matches_played: 5,
        matches_won: 3,
      },
      {
        name: "Team B",
        short_name: "TMB",
        players: [
          {
            _id: "player4",
            name: "Player 4",
            role: "Batsman",
            batting_style: "Left-Handed",
            bowling_style: "None",
          },
          {
            _id: "player5",
            name: "Player 5",
            role: "Bowler",
            batting_style: "Right-Handed",
            bowling_style: "Off Spin",
          },
          {
            _id: "player6",
            name: "Player 6",
            role: "Wicket-Keeper",
            batting_style: "Right-Handed",
            bowling_style: "None",
          },
        ],
        captain: "player5",
        coach: "Coach B",
        matches_played: 7,
        matches_won: 5,
      },
    ];

    // Insert teams into the database
    await Team.insertMany(teams);
    console.log("Teams seeded successfully!");

    // Close the connection
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding teams:", err);
    process.exit(1);
  }
};

seedTeams();
