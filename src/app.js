const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/development.cors');

const app = express();

// Enable CORS for all routes
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

module.exports = app;
