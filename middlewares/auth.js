const jwt = require('jsonwebtoken');
const httpStatusCodes = require('../errors/errors');
const { secretCode } = require('../utils/index');
const Unauthorized = require('../errors/unauthorized');

const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(httpStatusCodes.UNAUTHORIZED).send({ message: 'User is not authorized!' });
  }
  let payload;
  try {
    payload = jwt.verify(token, secretCode);
  } catch (err) {
    next(new Unauthorized('User is not authorized!'));
  }
  req.user = payload;
  return next();
};

module.exports = auth;
