const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
