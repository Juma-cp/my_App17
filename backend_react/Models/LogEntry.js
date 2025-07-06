const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../services/encryptionService');

const LogEntrySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  cravings: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  mood: {
    type: Number,
    min: 0,
    max: 10
  },
  stress: {
    type: Number,
    min: 0,
    max: 10
  },
  triggers: [String],
  notes: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number]
  }
}, { toJSON: { getters: true } });

// Geospatial Index for location queries
LogEntrySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LogEntry', LogEntrySchema);
