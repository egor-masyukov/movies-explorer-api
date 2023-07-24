const { NODE_ENV, JWT_SECRET } = process.env;
const jsonWebToken = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  let payload;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Пользователь не авторизирован'));
  } else {
    const token = authorization.replace('Bearer ', '');
    try {
      payload = jsonWebToken.verify(
        token,
        NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
      );
    } catch (err) {
      next(err);
    }
  }
  req.user = payload;
  next();
};

module.exports = auth;
