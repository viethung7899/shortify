const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const nanoid = require('nanoid');
const Shorty = require('./database/shorty');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static('./public'));
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

app.get('/:name', async (req, res) => {
  const {name} = req.params
  // TODO: redirect to url
  // Find
  try {
    const shorty = await Shorty.findOne({name});
    if (shorty) {
      return res.redirect(shorty.url);
    } else {
      throw new Error('Not found');
    }
  } catch (error) {
    next(error);
  }
});

app.post('/api/shorty', async (req, res, next) => {
  // TODO: create a short url
  let { url, name } = req.body;
  try {
    // Validate
    await schema.validate({
      url,
      name,
    });

    if (!name) {
      name = nanoid(5);
    }

    // Find
    const found = await Shorty.findOne({ name }).exec();
    console.log(found);
    if (found) {
      throw new Error('Name is already existed 🚫');
    }

    // Add
    const shorty = new Shorty({ url: url, name: name });
    const saved = await shorty.save();
    res.json({
      message: `Success`,
      newUrl: `localhost:3000/${saved.name}`
    })
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: error.message,
  });
});

app.listen(port, () => {
  console.log('App running on port', port);
});
