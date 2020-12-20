const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(morgan('common'));
app.use(express.json());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  console.log('Hello');
});

app.listen(port, () => {
  console.log('App running on port', port);
});
