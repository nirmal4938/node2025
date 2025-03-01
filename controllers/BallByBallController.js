const Ball = require('../models/BallByBallModel')
const Match = require('../models/MatchesModel')
const Player = require("../models/PlayerModel");

const AddBallData = async (req, res) => {
  try {
    const { match_id, over, ball_number, bowler, batsman, runs, wicket, extra } = req.body;

    const match = await Match.findOne({ _id: match_id });

    if (!match || match.status !== "In Progress") {
      return res.status(400).json({ error: "Match not live or does not exist" });
    }

    // Get the current innings
    const currentInningsIndex = match.innings.findIndex(
      (inning) => inning.inning_number === match.current_innings
    );

    if (currentInningsIndex === -1) {
      return res.status(400).json({ error: "Invalid innings data" });
    }

    const currentInnings = match.innings[currentInningsIndex];

    // Save the ball entry
    const newBall = new Ball({
      match_id,
      over,
      ball_number,
      bowler,
      batsman,
      runs,
      wicket,
      extra,
    });

    await newBall.save();

    // Update current innings score
    currentInnings.runs += runs;
    currentInnings.balls += 1;
    if (wicket) currentInnings.wickets += 1;

    // Track ball-by-ball data
    currentInnings.balls_data.push(newBall._id);

    // Auto-calculate overs from balls
    currentInnings.overs = Math.floor(currentInnings.balls / 6);

    // Update Batsman Stats
    const batsmanPlayer = await Player.findById(batsman);
    batsmanPlayer.batting_stats.runs += runs;
    batsmanPlayer.batting_stats.balls += 1;
    batsmanPlayer.batting_stats.strike_rate =
      (batsmanPlayer.batting_stats.runs / batsmanPlayer.batting_stats.balls) * 100;
    await batsmanPlayer.save();

    // Update Bowler Stats
    const bowlerPlayer = await Player.findById(bowler);
    bowlerPlayer.bowling_stats.runs_conceded += runs;
    bowlerPlayer.bowling_stats.balls += 1;
    if (wicket) bowlerPlayer.bowling_stats.wickets += 1;
    await bowlerPlayer.save();

    // Handle Innings Change
    if (
      currentInnings.balls >= match.overs * 6 || // All overs bowled
      currentInnings.wickets >= 10 // All wickets lost
    ) {
      if (match.current_innings === 1) {
        // Set Target for Second Innings
        match.target = currentInnings.runs + 1; // Target is always 1 run more
        match.current_innings = 2;
        match.batting_team = match.teams.find((team) => team !== currentInnings.team);
        match.bowling_team = currentInnings.team;
      } else {
        // Match is completed
        match.status = "Completed";

        // Determine Winner
        const firstInnings = match.innings[0];
        const secondInnings = match.innings[1];

        if (secondInnings.runs > firstInnings.runs) {
          match.winner = secondInnings.team;
        } else if (secondInnings.runs < firstInnings.runs) {
          match.winner = firstInnings.team;
        } else {
          match.winner = null; // Match Drawn
        }
      }
    }

    await match.save();

    res.json({ message: "Ball recorded", match });

    // Emit Live Score Update via WebSocket
    io.to(match_id).emit("liveScoreUpdate", match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { AddBallData };