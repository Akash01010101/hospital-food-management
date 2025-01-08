require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const users = [
            { email: 'hospital_manager@xyz.com', password: 'Password@2025', role: 'Manager' },
            { email: 'hospital_pantry@xyz.com', password: 'Password@2025', role: 'Pantry' },
            { email: 'hospital_delivery@xyz.com', password: 'Password@2025', role: 'Delivery' }
        ];

        // Clear existing users and seed new ones
        await User.deleteMany();
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
        }

        console.log('Users seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
};

seedUsers();
