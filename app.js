const express = require('express');

const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const httpStatusCodes = require('./errors/errors');

const DB = 'mongodb://127.0.0.1:27017/mestodb';
mongoose.connect(DB);
const router = require('./routes');
const { NOT_FOUND_ROUTE } = require('./const');

app.use((req, res, next) => {
  req.user = {
    _id: '65703da48dbd9adf8885f9e5',
  };

  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(PORT);

app.use('/users', router.users);
app.use('/cards', router.cards);
app.use('*', (req, res) => {
  res.status(httpStatusCodes.NOT_FOUND).send({ message: NOT_FOUND_ROUTE });
});
