'using strict';

const superagent = require('superagent');

function Location(query, data) {
  this.search_query = query;
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

Location.fetchLocation = function(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url).then(result => {
    if (!result.body.results.length) {
      throw 'No data';
    }
    let location = new Location(query, result.body.results[0]);
    return location.save().then(result => {
      location.id = result.rows[0].id;
      return location;
    });
  });
};

Location.lookup = handler => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1`;
  const values = [handler.query];

  return client
    .query(SQL, values)
    .then(results => {
      if (results.rowCount > 0) {
        handler.cacheHit(results);
      } else {
        handler.cacheMiss();
      }
    })
    .catch(console.error);
};

function getLocation(request, response) {
  const locationHandler = {
    query: request.query.data,

    cacheHit: results => {
      response.send(results.rows[0]);
    },

    cacheMiss: () => {
      Location.fetchLocation(request.query.data).then(data =>
        response.send(data)
      );
    }
  };
  Location.lookup(locationHandler);
}

modules.exports = getLocation;
