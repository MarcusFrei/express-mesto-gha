const httpStatusCodes = require('../errors/errors');
const User = require('../models/user');

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
      if (err.name === 'CastError') res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Bad request!' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(httpStatusCodes.CREATED).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Incorrect data was passed when creating a user!' });
      } else {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
      }
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send({ user });
      } else {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: 'User with current _id can\'t be found!' });
      }
    })
    .catch(() => {
      res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Bad request!' });
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (user) {
        res.send({ user });
      } else {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: 'User with current _id can\'t be found!' });
      }
    })
    .catch(() => {
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    });
};

module.exports = {
  getUsers, getUserById, createUser, updateUserInfo, updateAvatar,
};
