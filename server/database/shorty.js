const mongoose = require('mongoose');
const nanoid = require('nanoid');
const Schema = mongoose.Schema;
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log('SUCCESS'))
  .catch(console.log);

const shortySchema = new Schema({
  url: { type: String },
  name: { type: String },
});

const Shorty = mongoose.model('Shorty', shortySchema);

module.exports = Shorty;
