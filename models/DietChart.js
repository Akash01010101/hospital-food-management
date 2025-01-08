const mongoose = require('mongoose');

const DietChartSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    morningMeal: {
        foodItems: [String],
        instructions: String,
    },
    afternoonMeal: {
        foodItems: [String],
        instructions: String,
    },
    eveningMeal: {
        foodItems: [String],
        instructions: String,
    },
    nightMeal: {
        foodItems: [String],
        instructions: String,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DietChart', DietChartSchema);
