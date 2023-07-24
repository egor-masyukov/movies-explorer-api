const router = require('express').Router();
const userRoutes = require('./users');
const moviesRoutes = require('./movies');
const { login, createUser } = require('../controllers/users');
const { validateUserLogin, validateUserRegister } = require('../middlewares/validation');
const auth = require('../middlewares/auth');

const NotFoundError = require('../errors/NotFoundError');

router.post('/signin', validateUserLogin, login);
router.post('/signup', validateUserRegister, createUser);
router.use(auth);

router.use('/users', userRoutes);
router.use('/movies', moviesRoutes);
router.use((req, res, next) => {
  next(new NotFoundError('Такая страница не существует'));
});

module.exports = router;
