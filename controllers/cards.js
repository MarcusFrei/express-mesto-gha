const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch((err) => {
      res.status(500).send({ message: 'Internal Server Error' });
    });
};

const createCard = (req, res, next) => {
  console.log(req.body);
  const { name, link, owner } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'Error') {
        next(new Error('Get invalid data for card creation'));
      } else {
        console.error(err);
        res.status(400).send({ message: 'Internal Server Error' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card?.owner.toString() === req.user._id)
        return Card.findByIdAndDelete(req.params.cardId);
      else 
        res.status(400).send({ message: "This card can't be deleted!" });
    })
    .then(card => {
      if (card) {
        res.status(200).send({ message: "You've deleted this card!" });
      } else {
        res.status(404).send({ message: "Card with current _id can't be found!" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    });
};

const likeCard = (req, res) => {
  console.log(req.params.cardId);
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then(card => {
      if (card) {
        res.status(200).send({ message: 'You put like on this card!' });
      } else {
        res.status(404).send({ message: "The specified card _id doesn't exist!" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send({ message: 'Internal Server Error' });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,{ $pull: { likes: req.user._id } },{ new: true }) 
    .then(card => {
      if (card) {
        res.status(200).send({ message: 'You delete like from this card!' });
      } else {
        res.status(404).send({ message: "The specified card _id doesn't exist!" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send({ message: 'Internal Server Error' });
    });
}

module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };
 
