const mongoose = require('mongoose');

const carSearchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('CarSearch', carSearchSchema);
