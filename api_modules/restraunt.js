'using strict';

const superagent = require('superagent');

// Setup postgres interface
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

function Restaurant(data, loc_id) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created_at = Date.now();
  this.location_id = loc_id;
}

Restaurant.prototype.save = function() {
  const SQL = `INSERT INTO restaurants (name, rating, price, url, image_url, created_at, location_id) VALUES ($1,$2,$3,$4,$5,$6, $7) RETURNING *`;
  return client.query(SQL, Object.values(this));
};

Restaurant.lookup = handler => {
  const SQL = `SELECT * FROM restaurants WHERE location_id=$1`;
  const values = [handler.location];
  return client
    .query(SQL, values)
    .then(results => {
      results.rowCount > 0 ? handler.cacheHit(results) : handler.cacheMiss();
    })
    .catch(console.error);
};

Restaurant.fetch = request => {
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.formatted_query}`;

  return superagent
    .get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      let restraunts = result.body.businesses.map(
        bus => new Restaurant(bus, request.query.data.id)
      );
      restraunts.forEach(rest => rest.save());
      return restraunts;
    });
};

function getRestaurant(request, response) {
  const restrauntHandler = {
    location: request.query.data.id,
    cacheHit: results => {
      response.send(results.rows);
    },
    cacheMiss: () => {
      const restaurants = Restaurant.fetch(request);
      response.status(200).json(restaurants);
    }
  };

  Restaurant.lookup(restrauntHandler);
}

module.exports = getRestaurant;
