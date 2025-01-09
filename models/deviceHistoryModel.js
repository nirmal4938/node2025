const mongoose = require('mongoose');

// Define the deviceHistory schema
const DeviceHistoryPrimarySchema = new mongoose.Schema(
    {
        device_id: { type: String, required: true, index: true },
        device_type: {
            type: String,
            required: true,
            enum: [
                'Pump', 'Flow Meter', 'Chlorine Meter', 'PHTDS Meter',
                'Turbidity Meter', 'Pressure Meter', 'Level Gauge'
            ], // Only primary device types
            index: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        logical_device_id: { type: String, required: true }, // Logical device grouping
        metadata: {
            location: { type: String, required: true },
        },
        data: {
            value: { type: mongoose.Schema.Types.Mixed }, // Store any kind of value (e.g., power, flow rate, chlorine level)
            unit: { type: String }, // Unit of measurement (e.g., kW, m³/h, mg_per_liter)
            status: {
                type: String,
                enum: ['ACTIVE', 'INACTIVE', 'ON', 'OFF', null],
                default: null,
            }, // Operational state of the device
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
        toJSON: { virtuals: true }, // Enable virtuals in JSON output
    }
);



// Query Helper for Pagination
DeviceHistoryPrimarySchema.query.getPagedDeviceHistory = async function ({
    filter = {},
    sortOptions = {},
    skip = 0,
    limit = 10,
}) {
    // Ensure skip and limit are positive integers
    const skipParsed = Math.max(0, parseInt(skip, 10));
    const limitParsed = Math.max(1, parseInt(limit, 10)); // Default limit to avoid issues with 0

    try {
        // Build the aggregation pipeline dynamically
        const pipeline = [
            {
                $facet: {
                    rows: [
                        { $skip: skipParsed },
                        { $limit: limitParsed },
                        { $match: filter }, // Match documents based on filter
                        ...(Object.keys(sortOptions).length > 0 ? [{ $sort: sortOptions }] : []), // Conditional sort
                    ],
                    filteredCount: [{ $match: filter }, { $count: "count" }], // Count filtered documents
                    totalCount: [{ $count: "count" }], // Count all documents in the collection
                },
            },
        ];

        // Perform the aggregation
        const result = await this.model.aggregate(pipeline);

        // Extract rows, filtered count, and total count from the aggregation result
        const rows = result[0].rows;
        const filteredCount = result[0].filteredCount[0]?.count || 0;
        const totalCount = result[0].totalCount[0]?.count || 0;

        return {
            rows,
            pagination: {
                offset: skipParsed,
                limit: limitParsed,
                filteredCount, // Number of documents matching the filter
                totalCount, // Total number of documents in the collection
                totalPages: Math.ceil(filteredCount / limitParsed),
            },
        };
    } catch (error) {
        console.error("Error in getPagedDeviceHistory:", error.message);
        throw new Error(`Failed to fetch device history data: ${error.message}`);
    }
};




// Create indexes for better querying performance
DeviceHistoryPrimarySchema.index({ deviceId: 1, device_type: 1, timestamp: -1 });

// Create the DeviceHistory model
const DeviceHistory = mongoose.model('DeviceHistory', DeviceHistoryPrimarySchema);

// Export the model
module.exports = DeviceHistory;
