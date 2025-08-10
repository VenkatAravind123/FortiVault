const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes.jsx')
const passwordRoutes = require('./routes/passwordRoutes.jsx');
const authRoutes = require('./routes/authRoutes.jsx');
const cookieParser = require('cookie-parser')
require('dotenv').config();

const app = express();

// Middlewares

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));


const dburl = process.env.MONGO_URI
mongoose.connect(dburl).then(() => {
    console.log("Connected to the database")
}).catch((err) => {
    console.log(err)
})

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);
// app.use('/api/users', userRoutes);

// Server Port
const PORT = process.env.PORT || 2025;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
