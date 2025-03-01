const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Team name
      unique: true,
    },
    short_name: {
        type: String,
        unique: true,
        maxlength: 3, // Limit to 3 characters for abbreviation
        default: function () {
          // Default to the first 3 characters of the name
          if (this.name) {
            return this.name.substring(0, 3).toUpperCase();
          }
          return '';  // Return empty string if name is not provided
        },
      },
    team_contact_number: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: true,
    },
    players: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Player",
        default: []
    },
    captain: {
      type: String, // Player ID of the captain
      default: null,    
    },
    coach: {
      type: String, // Coach's name
      default: null, // Default to null if not provided
    },
    matches_played: {
      type: Number, // Total matches played
      default: 0, // Automatically set to 0 if not provided
    },
    matches_won: {
      type: Number, // Total matches won
      default: 0, // Automatically set to 0 if not provided
    },
    team_logo: {
      type: String, // Placeholder for team logo URL or path
      default: null,
    },
  },
  {
    timestamps: true, // Enables createdAt and updatedAt fields
  }
);
// Custom validation for players array length
teamSchema.path("players").validate(function (value) {
    return value.length <= 11;
  }, "A team cannot have more than 11 players");
module.exports = mongoose.model("Team", teamSchema);
