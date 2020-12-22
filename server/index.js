const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const { nanoid } = require('nanoid/non-secure');

const Shorty = require('./database/shorty');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Set view engine
app.set('view engine', 'ejs');

// Valid schema
const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .matches(/[A-Za-z0-9_-]/),
  url: yup.string().trim().url().required(),
});

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  return res.render('index', { result: null });
});

// TODO: create a short url
app.post('/', async (req, res, next) => {
  let { url, name } = req.body;
  try {
    if (!name || name.trim().length === 0) {
      name = nanoid(5);
    }

    console.log(name);
    // Validate
    await schema.validate({
      url,
      name,
    });

    // Find
    const found = await Shorty.findOne({ name }).exec();
    console.log(found);
    if (found) {
      throw new Error('Name is already existed 🚫');
    }

    // Add
    const shorty = new Shorty({ url: url, name: name });
    await shorty.save();
    const result = {
      type: 'SUCCESS',
      message: 'Successful',
      url: `${req.headers.host}/${name}`,
    };
    return res.render('index', { result: result });
  } catch (error) {
    next(error);
  }
});

// TODO: redirect to url
app.get('/:name', async (req, res, next) => {
  const { name } = req.params;

  // Find
  const shorty = await Shorty.findOne({ name });
  if (shorty) {
    return res.redirect(shorty.url);
  } else {
    next();
  }
});

// Redirect to 404 page
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handling middleware
app.use((error, req, res, next) => {
  statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  const result = {
    type: 'ERROR',
    message: error.message,
  };
  res.render('index', { result: result });
});

app.listen(port, () => {
  console.log('App running on port', port);
});
