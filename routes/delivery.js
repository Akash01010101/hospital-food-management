const express = require('express');
const router = express.Router();
const PantryStaff = require('../models/PantryStaff');
const authMiddleware = require('../middleware/authMiddleware');
const Patient = require('../models/Patient');

router.post('/', authMiddleware(['Manager']), async (req, res) => {
    try {
        const staff = new PantryStaff(req.body);
        staff.role = "Delivery";
        await staff.save();
        res.status(201).json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/delete-delivery/:staffId/:deliveryId', authMiddleware(['Manager', 'Delivery']), async (req, res) => {  
    try {  
        const { staffId, deliveryId } = req.params;  

        
        const staff = await PantryStaff.findById(staffId);  
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });  

        
        const initialLength = staff.assignedDeliveries.length;
        staff.assignedDeliveries = staff.assignedDeliveries.filter(delivery => delivery._id.toString() !== deliveryId);

        if (staff.assignedDeliveries.length === initialLength) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        
        await staff.save();  

        res.json({ message: "Delivery deleted successfully", staff });  
    } catch (err) {  
        console.error("Error deleting delivery:", err);
        res.status(500).json({ error: 'Internal server error' });  
    }  
});


router.put('/assign-delivery/:staffId', authMiddleware(['Manager', 'Pantry']), async (req, res) => {
    try {
        const { staffId } = req.params;
        const { dietChartId, patientId } = req.body;

        
        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        
        const existingAssignment = await PantryStaff.findOne({
            "assignedDeliveries.dietChartId": dietChartId,
            "assignedDeliveries.status": { $ne: "Completed" },
        });

        if (existingAssignment) {
            return res.status(400).json({ error: "This diet chart is already assigned for delivery." });
        }

        
        staff.assignedDeliveries.push({ dietChartId, patientId, status: "Pending" });
        await staff.save();

        res.json({ message: "Delivery assigned successfully", staff });
    } catch (err) {
        console.error("Error assigning delivery:", err);
        res.status(400).json({ error: err.message });
    }
});


router.put('/update-delivery/:staffId/:deliveryId', authMiddleware(['Delivery','Pantry']), async (req, res) => {
    try {
        const { staffId, deliveryId } = req.params;
        const { status, deliveryNotes } = req.body;

        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        const delivery = staff.assignedDeliveries.id(deliveryId);
        if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

        delivery.status = status;
        if (status === "Delivered") delivery.deliveredAt = new Date();
        if (deliveryNotes) delivery.deliveryNotes = deliveryNotes;

        await staff.save();

        res.json({ message: "Delivery updated successfully", staff });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.get('/:staffId/deliveries', authMiddleware(['Delivery']), async (req, res) => {
    try {
        const { staffId } = req.params;

        const staff = await PantryStaff.findById(staffId).populate('assignedDeliveries.dietChartId');
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        res.json(staff.assignedDeliveries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
