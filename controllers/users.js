const bcrypt = require('bcryptjs');
const jsonWebToken = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const ForbiddenError = require('../errors/ForbiddenError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new ForbiddenError('Введите данные'));
  } else {
    User.findOne({ email })
      .select('+password')
      .orFail(() => new Error('Not found'))
      .then((user) => {
        bcrypt.compare(String(password), user.password)
          .then((isValidUser) => {
            if (isValidUser) {
              const token = jsonWebToken.sign(
                { _id: user._id },
                NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
                { expiresIn: '7d' },
              );
              res.status(200).send({ token });
            } else {
              next(new UnauthorizedError('Неверные данные для входа'));
            }
          });
      })
      .catch((err) => {
        if (err.message === 'Not found') {
          next(new UnauthorizedError('Неверные данные для входа'));
        } else if (err.name === 'ValidationError') {
          next(new BadRequestError('Переданы некорректные данные'));
        } else {
          next(err);
        }
      });
  }
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(String(password), 10)
    .then((hashedPassword) => {
      User.create({
        name, about, avatar, email, password: hashedPassword,
      })
        .then((user) => res.status(201).send(user))
        .catch((err) => {
          if (err.message.includes('Validation failed')) {
            next(new BadRequestError('Вы ввели некоректные данные'));
          } else if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id).then((user) => {
    if (!user) {
      next(new NotFoundError('Пользователь не найден.'));
    } else {
      res.status(200).send(user);
    }
  }).catch((err) => {
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы некорректные данные'));
    } else {
      next(err);
    }
  });
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(() => new Error('Not found'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message.includes('Validation failed')) {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Некорректный id пользователя'));
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else if (err.message === 'Not found') {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  login,
  createUser,
  getUserInfo,
  updateUser,
};
