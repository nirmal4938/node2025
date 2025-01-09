const mongoose = require('mongoose')
const AlarmAlertSchema = new mongoose.Schema(
    {
        device_id: { type: String, required: true, index: true },
        device_type: {
            type: String,
            required: true,
            enum: ['Pump', 'Flow Meter', 'Chlorine Meter', 'Water Level Sensor', 'Pressure Meter'],
        },
        timestamp: { type: Date, default: Date.now }, // When the alarm was triggered
        alarm_type: {
            type: String,
            enum: ['CRITICAL', 'WARNING', 'INFORMATION'], // Priority levels
            required: true,
        },
        alert_message: { type: String, required: true }, // Message or description of the alarm
        trigger_condition: { type: String, required: true }, // The condition that triggered the alarm
        metadata: {
            location: { type: String, required: true }, // Where the alarm originated
        },
        acknowledged: {
            type: Boolean,
            default: false
        }, // Whether the alarm has been acknowledged
        acknowledged_by: { type: String }, // User or system who acknowledged it
        acknowledged_at: { type: Date }, // When it was acknowledged
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const AlarmAlert = mongoose.model('AlarmAlert', AlarmAlertSchema);
module.exports = AlarmAlert;