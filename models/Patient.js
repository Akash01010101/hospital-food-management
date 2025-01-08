const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    contactInfo: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    diseases: [String],
    allergies: [String],
    roomNumber: { type: String, required: true },
    bedNumber: { type: String, required: true },
    floorNumber: { type: Number, required: true },
});

module.exports = mongoose.model('Patient', PatientSchema);
