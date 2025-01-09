const DeviceHistory = require('../models/deviceHistoryModel');
const alarmManager = require('./alarms/AlarmManager')
const AlarmAlert = require('../models/AlarmAlertModel')
// Get all history data
const get = async (req, res) => {
    try {
        console.log("Incoming query parameters:", req.query);

        const { sort, offset = 0, limit = 10, filter = '{}' } = req.query;

        // Ensure skip and limit are positive integers
        const skip = Math.max(0, parseInt(offset, 10) || 0);
        const limitParsed = Math.max(1, parseInt(limit, 10) || 10);

        // Parse the filter parameter as a JSON object
        let parsedFilter = {};
        try {
            parsedFilter = JSON.parse(filter);
        } catch (err) {
            console.error("Error parsing filter parameter:", err.message);
            throw new Error("Invalid filter parameter format. Expected a JSON string.");
        }

        // Construct the MongoDB filter query based on parsed filter
        const mongoFilter = {};

        // Add search conditions based on filter
        if (parsedFilter.q) {
            const searchValue = parsedFilter.q;
            mongoFilter.$or = [
                { deviceId: { $regex: searchValue, $options: 'i' } },
                { device_type: { $regex: searchValue, $options: 'i' } },
                { 'metadata.location': { $regex: searchValue, $options: 'i' } },
                { 'data.status': { $regex: searchValue, $options: 'i' } },
                { 'data.level': { $regex: searchValue, $options: 'i' } }
            ];
        }

        // Parse the `sort` parameter to extract field and order
        let sortOptions = {};
        if (sort) {
            try {
                const sortArray = JSON.parse(sort); // Parse sort from string to an array
                sortArray.forEach(([field, order]) => {
                    console.log("order", order, field);
                    if (field === "location") {
                        sortOptions["metadata.location"] = order.toUpperCase() === 'DESC' ? -1 : 1;
                    } else {
                        sortOptions[field] = order.toUpperCase() === 'DESC' ? -1 : 1;
                    }
                });
            } catch (err) {
                console.error("Error parsing sort parameter:", err.message);
                throw new Error("Invalid sort parameter format. Expected a JSON string.");
            }
        }

        // Use query helper
        const { rows, pagination } = await DeviceHistory.find().getPagedDeviceHistory({
            filter: mongoFilter, // Apply the constructed filter here
            sortOptions,
            skip,
            limit: limitParsed,
        });

        // Format the response
        res.status(200).json({
            rows,
            count: pagination.totalCount,
        });
    } catch (error) {
        console.error("Error in getPagedDeviceHistory:", error.message);
        res.status(500).json({ error: error.message });
    }
};







// Save new history data (for API requests)
const saveHistory = async (req, res) => {
    const { deviceId, device_type, data, metadata } = req.body;

    // Validate required fields in request body
    if (!deviceId || !device_type || !data) {
        return res.status(400).json({ error: 'Missing required fields: deviceId, deviceType, or data' });
    }

    try {
        const newHistory = new DeviceHistory({
            deviceId,
            device_type,
            timestamp: new Date(),
            metadata,
            data
        });

        // Save the new history to the database
        await newHistory.save();
        res.status(201).json(newHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Process incoming MQTT message and save to history collection
const processPrimaryDevicesData = async (messageBuffer) => {
    try {
        // Convert the messageBuffer to string
        const stringMessage = messageBuffer.toString();
        console.log("String message:", stringMessage);

        // Parse JSON string to object
        const parsedMessage = JSON.parse(stringMessage);
        console.log("Parsed message: ---", parsedMessage);

        // Extract deviceId, deviceType, and data from the parsed message
        const { device_id, device_type, data, metadata, logical_device_id } = parsedMessage;

        // Check if the message has the necessary data
        if (!device_id || !device_type || !data) {
            console.error('Invalid message format: Missing deviceId, deviceType, or data 117');
            return;
        }

        // Save the message to the DeviceHistory collection
        const newHistory = new DeviceHistory({
            device_id,
            device_type,
            timestamp: new Date(),
            metadata,
            data,
            logical_device_id
        });

        // Save the new history data to the database
        await newHistory.save();
        console.log('Processed message saved successfully to deviceHistory collection');
        // Evaluate alarms using AlarmManager
        const triggeredAlarms = alarmManager.evaluateAll({
            ...data, // Spread data so parameters can be accessed directly
            device_id,
            device_type,
            metadata,
            logical_device_id
        });
        console.log("triggeredAlarms", triggeredAlarms)
        // Save triggered alarms to AlarmAlert collection
        for (const alarm of triggeredAlarms) {
            console.log("alarm", alarm)
            const newAlarm = new AlarmAlert(alarm);
            await newAlarm.save();
            console.log(`Alarm saved: ${alarm.alert_message}`);
        }
    } catch (error) {
        console.error('Error processing MQTT message:', error.message);
    }
};

// Export the functions for use in the routes
module.exports = {
    get,
    saveHistory,
    processPrimaryDevicesData, // Export the processPrimaryDevicesData function to be used by MQTT client
};
