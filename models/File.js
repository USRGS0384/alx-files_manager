const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  size: Number,
  uploadedAt: Date,
});

module.exports = mongoose.model('File', fileSchema);

