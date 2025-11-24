const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json()); 

// --- Database Connection ---
const connectDB = async () => {
    try {
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Stop the app if DB fails
    }
};
connectDB();


const transactionRoutes = require('./routes/transaction');
const authRoutes = require('./routes/auth'); 


app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);




// --- Base Route (Health Check) ---
app.get('/', (req, res) => {
    res.send('Smart Hotel Accountability System API is running.');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});