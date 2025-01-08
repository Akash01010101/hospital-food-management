const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const patientRoutes = require('./routes/patient');
const dietChartRoutes = require('./routes/dietChart');
const pantryRoutes = require('./routes/pantry');
const deliveryRoutes = require('./routes/delivery');
const authRoutes = require('./routes/auth');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(require('cors')());

app.use('/api/delivery', deliveryRoutes);

app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/patients', patientRoutes);

app.use('/api/pantry', pantryRoutes);

app.use('/api/diet-charts', dietChartRoutes);
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
