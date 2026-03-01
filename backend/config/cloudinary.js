const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dwfm8qeoz",
  api_key: process.env.CLOUDINARY_API_KEY || "659826852923862",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "tUIYTEgLGCsZq-OU0-gtuBRit6s",
  secure: true,
});

module.exports = cloudinary;
