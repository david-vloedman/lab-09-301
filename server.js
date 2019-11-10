'use strict';

require('dotenv').config();

//Dependencies and setup
const getMovie = require('./api_modules/movie.js');
const getLocation = require('./api_modules/location');
const getWeather = require('./api_modules/weather.js');
const getRestraunt = require('./api_modules/restraunt.js');
const express = require('express');
const cors = require('cors');

const pg = require('pg');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

//Configure Database
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

//Errors
function notFoundHandler(request, response) {
  response.status(404).send('huh?');
}
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

// API Routes

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/movies', getMovie);
app.get('/yelp', getRestraunt);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
