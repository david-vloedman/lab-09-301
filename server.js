'use strict';

require('dotenv').config();

//Dependencies and setup
const getMovie = require('./api_modules/movie.js');
const getLocation = require('./api_modules/location');
const getWeather = require('./api_modules/weather.js');
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
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

//Constructor Functions

function Restaurant(data) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created_at = Date.now();
}

//Define a prototype function to save data to DB

//My Static Constructor Functions

Restaurant.fetch = (location, response) => {};

// API Routes

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/movies', getMovie);
app.get('/yelp', getRestraunt);

//Route Handlers

function getRestraunt(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.formatted_query}`;
  return superagent
    .get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      response.send(result.body.businesses.map(bus => new Restaurant(bus)));
    });
}

app.use('*', notFoundHandler);
app.use(errorHandler);

// HELPER FUNCTIONS

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
