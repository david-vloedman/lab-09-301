'using strict';

const superagent = require('superagent');

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}

function getMovies(request, response) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&include_adult=false&query=${request.query.data.search_query}`;

  superagent
    .get(url)
    .then(data => {
      const movies = data.body.results.map(movie => {
        return new Movie(movie);
      });
      response.status(200).json(movies);
    })
    .catch(() => {
      errorHandler(
        'So, so, so, sorry. Something went wrong',
        request,
        response
      );
    });
}

module.exports = getMovies;
