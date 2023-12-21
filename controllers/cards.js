const httpStatusCodes = require('../errors/errors');
const Card = require('../models/card');
const NotFound = require('../errors/notFound');
const BadRequest = require('../errors/badRequest');
const { INTERNAL_SERVER_ERROR } = require('../const');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(() => {
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: INTERNAL_SERVER_ERROR });
    });
};

const createCard = (req, res) => {
  const { name, link, owner } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(httpStatusCodes.CREATED).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Get invalid data for card creation!' });
      } else {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId).orFail(() => new NotFound('Card with current _id can\'t be found!'))
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        return Card.findByIdAndDelete(req.params.cardId);
      } throw new BadRequest('This card can\'t be deleted!');
    })
    .catch((err) => {
      if (err.name === 'NotFound') res.status(httpStatusCodes.NOT_FOUND).send({ message: err.message });
      else if (err.name === 'CastError' || err.name === 'BadRequest') res.status(httpStatusCodes.BAD_REQUEST).send({ message: err.message });
      else res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(httpStatusCodes.OK).send({ message: 'You put like on this card!' });
      } else {
        throw new NotFound('The specified card _id doesn\'t exist!');
      }
    })
    .catch((err) => {
      if (err.name === 'NotFound') {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: err.message });
      } else if (err.name === 'CastError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Bad request!' });
      } else {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(200).send({ message: 'You delete like from this card!' });
      } else {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: 'The specified card _id doesn\'t exist!' });
      }
    })
    .catch((err) => {
      if (err.name === 'NotFound') {
        res.status(httpStatusCodes.NOT_FOUND).send({ message: err.message });
      } else if (err.name === 'CastError') {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Bad request!' });
      } else {
        res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal server error' });
      }
    });
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};

// cards - 400, 500
// cards/:cardId - 404
// cards/:cardId/likes - 400,404,500

// ValidationError Ошибка валидации. Возникает, когда данные не соответствуют схеме.
// CastError Ошибка валидации. Возникает, когда передан невалидный ID.
// Идентификаторы в MongoDB имеют определённую структуру
// DocumentNotFoundError Возникает, когда объект не найден.
// По умолчанию, если объект не найден, эта ошибка не генерируется.
// Чтобы это изменить, используйте метод orFail)
