const express = require('express');

const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const httpStatusCodes = require('./errors/errors');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');

const DB = 'mongodb://127.0.0.1:27017/mestodb';
mongoose.connect(DB);
const router = require('./routes');
const { NOT_FOUND_ROUTE } = require('./const');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(PORT);
app.post('/signin', login);
app.post('/signup', createUser);
app.use('/users', auth, router.users);
app.use('/cards', router.cards);
app.use('*', (req, res) => {
  res.status(httpStatusCodes.NOT_FOUND).send({ message: NOT_FOUND_ROUTE });
});
