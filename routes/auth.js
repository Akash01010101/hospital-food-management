const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Register a user (for initial setup or additional users)
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Ensure role is valid
        if (!['Manager', 'Pantry', 'Delivery'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = new User({ email, password, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
