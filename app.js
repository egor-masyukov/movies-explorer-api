const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes');
require('dotenv').config();

const { NODE_ENV, PORT, MONGODB_URL } = process.env;

const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(
  cors(),
);

mongoose.connect(NODE_ENV === 'production' ? MONGODB_URL : 'mongodb://127.0.0.1:27017/bitfilmsdb', {
  useNewUrlParser: true,
  // eslint-disable-next-line no-console
}).then(() => console.log('DB Connected'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(router);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(NODE_ENV === 'production' ? PORT : '3000', () => {
  // eslint-disable-next-line no-console
  console.log(NODE_ENV === 'production' ? PORT : '3000');
});
