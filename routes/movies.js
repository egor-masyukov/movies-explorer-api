const router = require('express').Router();
const {
  getMovies, createMovie, deleteMovie,
} = require('../controllers/movie');
const { validateMovieCreation, validateMovieId } = require('../middlewares/validation');

router.get('/', getMovies);

router.post('/', validateMovieCreation, createMovie);

router.delete('/:movieId', validateMovieId, deleteMovie);

module.exports = router;
