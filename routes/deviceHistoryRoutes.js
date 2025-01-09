const express = require('express');
const {
    get,
    saveHistory,
} = require('../controllers/deviceHistoryController');

const router = express.Router();

// Route to get all history data
router.get('/', get);

// Route to save new history data
router.post('/', saveHistory);

module.exports = router;

// const express = require('express');
// const router = express.Router();

// Dummy data for device history
// const deviceHistory = [
//     {
//         "_id": "676941be8c1b59bc1c6e4363",
//         "deviceId": "gsr002",
//         "deviceType": "GSR Tank",
//         "timestamp": "2024-12-23T10:55:58.869Z",
//     },
//     {
//         "_id": "676941be8c1b59bc1c6e4362",
//         "deviceId": "esr001",
//         "deviceType": "ESR Tank",
//         "timestamp": "2024-12-23T10:55:58.862Z",
//     }
// ]


// // API endpoint to fetch device history
// router.get('/', (req, res) => {
//     res.status(200).json(deviceHistory);
// });

// module.exports = router;
