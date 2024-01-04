const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const httpStatusCodes = require('../errors/errors');
const User = require('../models/user');
const { secretCode } = require('../utils/index');

const login = (req, res) => {
  const { email, password } = req.body;
  User.findUser(email, password).then((user) => {
    const token = jwt.sign({ id: user._id }, secretCode, { expiresIn: '7d' });
    res.cookie('jwt', token, { maxAge: 1000 * 3600 * 24 * 7, httpOnly: true, domain: '.localhost' });
    res.status(200).send({ id: user._id });
  })
    .catch((err) => {
      if (err.name === 'NotFound') res.status(httpStatusCodes.NOT_FOUND).send({ message: err.message });
      else if (err.name === 'Unauthorized') res.status(httpStatusCodes.UNAUTHORIZED).send({ message: err.message });
      else res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(() => {
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    });
};

const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: 'User with current _id can\'t be found!' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Get invalid data for finding this user!' });
      else res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    });
};

const getMe = (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        res.status(httpStatusCodes.NOT_FOUND.send({ message: 'User with current _id can\'t be found!' }));
      }
      return res.status(httpStatusCodes.OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Get invalid data for finding this user!' });
      else res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hashPassword) => User.create({
      name, about, avatar, email, password: hashPassword,
    }))
    .then((user) => res.status(httpStatusCodes.CREATED).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Incorrect data was passed when creating a user!' });
      } else if (err.name === 'MongoServerError' || err.code === 11000) {
        res.status(httpStatusCodes.CONFLICT).send({ message: 'User with this email already exists!' });
      } else {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
      }
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user.id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send({ user });
      } else {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: 'User with current _id can\'t be found!' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Incorrect data was passed when updating a user!' });
      } else if (err.name === 'CastError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Bad request!' });
      } else {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user.id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send({ user });
      } else {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: 'User with current _id can\'t be found!' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Incorrect data was passed when updating user \'s avatar!' });
      } else if (err.name === 'CastError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Bad request!' });
      } else {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
      }
    });
};

module.exports = {
  getUsers, getUserById, createUser, updateUserInfo, updateAvatar, login, getMe,
};

// users- 400, 500
// users/:userId - 400, 500
// users/me - 500
// /me/avatar - 400,404,500
