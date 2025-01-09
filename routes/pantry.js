const express = require('express');
const router = express.Router();
const PantryStaff = require('../models/PantryStaff');
const DietChart = require('../models/DietChart');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware(['Manager','Pantry']), async (req, res) => {
    try {
        const staff = new PantryStaff(req.body);
        await staff.save();
        res.status(201).json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.get('/', authMiddleware(['Manager', 'Pantry','Delivery']), async (req, res) => {
    try {
        const staffList = await PantryStaff.find().populate('assignedTasks.dietChartId');
        res.json(staffList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/p', authMiddleware(['Manager', 'Pantry','Delivery']), async (req, res) => {
  try {
      const staffList = await PantryStaff.find()
          .populate('assignedTasks.dietChartId') 
          .populate({
              path: 'assignedDeliveries.dietChartId', 
              select: 'name patientId', 
              populate: {
                  path: 'patientId', 
                  select: 'name bedNumber', 
              },
          })
          .populate({
              path: 'assignedDeliveries.patientId', 
              select: 'name bedNumber', 
          });

      res.json(staffList);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


router.put('/assign-task/:staffId', authMiddleware(['Manager']), async (req, res) => {
    try {
        const { staffId } = req.params;
        const { dietChartId } = req.body;

        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        staff.assignedTasks.push({ dietChartId });
        await staff.save();

        res.json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.put('/update-task/:staffId/:taskId', authMiddleware(['Pantry']), async (req, res) => {
    try {
        const { staffId, taskId } = req.params;
        const { status } = req.body;

        const staff = await PantryStaff.findById(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        const task = staff.assignedTasks.id(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        task.status = status;
        await staff.save();

        res.json(staff);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.delete('/:staffId', authMiddleware(['Manager']), async (req, res) => {
    try {
        const { staffId } = req.params;

        const staff = await PantryStaff.findByIdAndDelete(staffId);
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        res.json({ message: 'Staff member removed successfully', staff });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete("/delete-task/:staffId/:taskId",authMiddleware(['Pantry','Manager']), async (req, res) => {
    const { staffId, taskId } = req.params;
  
    try {
      
      const staff = await PantryStaff.findById(staffId);
  
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
  
      
      const updatedTasks = staff.assignedTasks.filter(
        (task) => task._id.toString() !== taskId
      );
  
      
      staff.assignedTasks = updatedTasks;
      await staff.save();
  
      res.status(200).json({ message: "Task deleted successfully", staff });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Server error while deleting task" });
    }
  });
  router.delete("/:id/delete-all-tasks", authMiddleware(['Manager','Pantry']), async (req, res) => {
    try {
      const staffId = req.params.id;
  
      
      const updatedStaff = await PantryStaff.findByIdAndUpdate(
        staffId,
        { assignedTasks: [],assignedDeliveries: [] },
        { new: true }
      );
  
      if (!updatedStaff) {
        return res.status(404).json({ message: "Staff member not found." });
      }
  
      res.status(200).json({ message: "All tasks deleted successfully.", staff: updatedStaff });
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      res.status(500).json({ message: "Failed to delete all tasks.", error });
    }
  });
module.exports = router;
