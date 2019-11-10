'using strict';

const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', error => console.error(error));

function Movie(movie, id) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
  this.created_at = Date.now();

  this.location_id = id;
}

Movie.prototype.save = function() {
  const SQL = `INSERT INTO movies (title, overview, average_votes, total_votes,image_url, popularity, released_on, created_at, location_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
  return client.query(SQL, Object.values(this));
};

Movie.fetchMovies = query => {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&include_adult=false&query=${query.data.search_query}`;

  superagent
    .get(url)
    .then(data => {
      const movies = data.body.results.map(
        movie => new Movie(movie, query.data.id)
      );
      movies.forEach(movie => movie.save());
      return movies;
    })
    .catch(console.error);
};

Movie.lookup = handler => {
  const SQL = `SELECT * FROM movies WHERE location_id=$1`;
  const values = [handler.location];

  return client
    .query(SQL, values)
    .then(results => {
      results.rowCount > 0 ? handler.cacheHit(results) : handler.cacheMiss();
    })
    .catch(console.error);
};

function getMovies(request, response) {
  const movieHandler = {
    location: request.query.data.id,

    cacheHit: results => {
      console.log(results);
      response.send(results.rows);
    },

    cacheMiss: () => {
      console.log('at cache miss');
      const movies = Movie.fetchMovies(request.query);

      response.status(200).json(movies);
    }
  };

  Movie.lookup(movieHandler);
}

module.exports = getMovies;
