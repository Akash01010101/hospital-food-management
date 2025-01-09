const mongoose = require('mongoose');

const PantryStaffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactInfo: { type: String, required: true },
    role: { type: String, enum: ['Chef', 'Delivery'], required: true },
    assignedTasks: [
        {
            dietChartId: { type: mongoose.Schema.Types.ObjectId, ref: 'DietChart' },
            status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
        },
    ],
    assignedDeliveries: [
        {
          dietChartId: { type: mongoose.Schema.Types.ObjectId, ref: 'DietChart' },
          patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
          bedNumber: { type: String,ref: 'Patient' }, // Add this field
          status: { type: String, default: "Pending" },
          deliveredAt: { type: Date },
          deliveryNotes: { type: String },
        },
      ],
});

module.exports = mongoose.model('PantryStaff', PantryStaffSchema);
