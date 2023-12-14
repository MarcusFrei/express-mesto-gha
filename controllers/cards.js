const httpStatusCodes = require('../errors/errors');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(() => {
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
    });
};

const createCard = (req, res, next) => {
  const { name, link, owner } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'Error') {
        next(new Error('Get invalid data for card creation'));
      } else {
        res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'Internal Server Error' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId).orFail(() => { throw new Error('cardNotFound'); })
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        return Card.findByIdAndDelete(req.params.cardId);
      } throw new Error('invalidOwner');
    })
    .then((card) => {
      if (card) {
        res.status(httpStatusCodes.OK).send({ message: 'You\'ve deleted this card!' });
      }
    })
    .catch((err) => {
      if (err.message === 'cardNotFound') res.status(404).send({ message: 'Card with current _id can\'t be found!' });
      if (err.message === 'invalidOwner') res.status(httpStatusCodes.BAD_REQUEST).send({ message: 'This card can\'t be deleted!' });
      if (err.name === 'CastError') res.status(400).send({ message: 'Card with current _id can\'t be found!' });
      else res.status(500).send({ message: 'Internal Server Error' });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(httpStatusCodes.OK).send({ message: 'You put like on this card!' });
      } else {
        res.status(404).send({ message: 'The specified card _id doesn\'t exist!' });
      }
    })
    .catch(() => {
      res.status(400).send({ message: 'Internal Server Error' });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.status(200).send({ message: 'You delete like from this card!' });
      } else {
        res.status(404).send({ message: 'The specified card _id doesn\'t exist!' });
      }
    })
    .catch(() => {
      res.status(400).send({ message: 'Internal Server Error' });
    });
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
};
