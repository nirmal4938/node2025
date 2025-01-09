
// const AlarmAlert = require('./models/AlarmAlert'); // Import the AlarmAlert model

const AlarmAlert = require('../models/AlarmAlertModel')
/**
 * Utility function to fetch alarms by priority
 * @param {String} priority - The priority level ('CRITICAL', 'INFORMATION', 'WARNING')
 * @param {Object} filters - Additional filters (e.g., device_id, location)
 * @param {Object} options - Query options (e.g., pagination, sorting)
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of alarms
 */
const getAlarmsByPriority = async (priority, filters = {}, options = {}) => {
    try {
        // Ensure the priority is valid
        const validPriorities = ['CRITICAL', 'INFORMATION', 'WARNING'];
        if (!validPriorities.includes(priority)) {
            throw new Error(`Invalid priority: ${priority}. Must be one of ${validPriorities.join(', ')}`);
        }

        // Build the query object
        const query = {
            alarm_type: priority,
            ...filters, // Add additional filters (e.g., device_id, location)
        };

        // Default options
        const { limit = 10, skip = 0, sort = { timestamp: -1 } } = options;

        // Query the database
        const alarms = await AlarmAlert.find(query)
            .limit(limit)
            .skip(skip)
            .sort(sort);

        return alarms;
    } catch (error) {
        console.error('Error fetching alarms by priority:', error.message);
        throw error;
    }
};

module.exports = { getAlarmsByPriority };
