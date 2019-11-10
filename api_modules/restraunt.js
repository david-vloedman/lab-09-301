'using strict';

const superagent = require('superagent');

function Restaurant(data) {
  this.name = data.name;
  this.rating = data.rating;
  this.price = data.price;
  this.url = data.url;
  this.image_url = data.image_url;
  this.created_at = Date.now();
}

function getRestraunt(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.formatted_query}`;
  return superagent
    .get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      response.send(result.body.businesses.map(bus => new Restaurant(bus)));
    });
}

module.exports = getRestraunt;
