// middleware/fileUpload.js
const {mongoose} = require('mongoose')
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');

const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      return {
        bucketName: 'uploads', // Set the GridFS bucket name
        filename: `${Date.now()}-${file.originalname}`, // Custom filename with timestamp
        metadata: { mimeType:file.mimetype }, // Optional metadata
      };
    },
  });
// Multer upload instance with GridFS storage

// Setup GridFS bucket for file retrieval
const getGridFSFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });

    // Find file in GridFS metadata
    const file = await mongoose.connection.db
      .collection("uploads.files")
      .findOne({ _id: mongoose.Types.ObjectId(fileId) });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Stream file to response
    res.set("Content-Type", file.metadata.mimeType || "application/octet-stream");
    const downloadStream = bucket.openDownloadStream(mongoose.Types.ObjectId(fileId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ error: "Failed to retrieve file" });
  }
};



const upload = multer({ storage });

module.exports = { upload, getGridFSFile };
