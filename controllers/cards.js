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
        next(new Error('Переданы некорректные данные при создании карточки'));
      } else {
        console.error(err);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card?.owner.toString() === req.user._id)
        return Card.findByIdAndDelete(req.params.cardId);
      else 
        res.status(400).send({ message: 'Карточку нельзя удалить!' });
    })
    .then(card => {
      if (card) {
        res.send({ card });
      } else {
        res.status(404).send({ message: 'Карточка с указанным _id не найдена.' });
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
        res.send({ card });
      } else {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId,{ $pull: { likes: req.user._id } },{ new: true }) 
    .then(card => {
      if (card) {
        res.send({ card });
      } else {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    });
}

module.exports = { getCards, createCard, deleteCard, likeCard, dislikeCard };
