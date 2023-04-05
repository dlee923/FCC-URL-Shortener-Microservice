require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns_ = require('dns');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// MongoDB Schema
const shortURLSchema = new mongoose.Schema({
  fullURL: {
    type: String,
    required: true
  },
  shortURL: Number
});

// MongoDB Model
const ShortURL = mongoose.model('ShortURL', shortURLSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use('/', bodyParser.urlencoded({ extended: false }))

function saveToMongoDB(fullURL, shortURL, done) {
  let newShortURL = new ShortURL({
    fullURL: fullURL, shortURL: shortURL
  });
  newShortURL.save((err, data) => {
    if (err !== null) {
      console.log(err);
      console.log('Save failed...')
    } else {
      console.log(data);
      console.log('Save successful...')
    }
  });
  console.log('Saving to MongoDB...\nFullURL: ' + fullURL + '\nShortURL: ' + shortURL);
}

app.post('/api/shorturl', function(req, res) {
  let invalidURLObj = { error: 'invalid url' };
  const req_original_url = req.body.url;
  const req_short_url = Math.floor(Math.random() * 100000).toString();
  let shortURLObj = {
    original_url: req_original_url,
    short_url: req_short_url
  };
  var dns_host_url = '';

  if (req_original_url.includes('https://')) {
    dns_host_url = req_original_url.slice(8);
  } else if (req_original_url.includes('http://')) {
    dns_host_url = req_original_url.slice(7);
  } else {
    dns_host_url = req_original_url
  }

  dns_.lookup(dns_host_url, (err, addresses) => {
    if (err !== null) {
      console.log(err);
      res.json(invalidURLObj);
    } else {
      console.log(addresses);
      res.json(shortURLObj);
      saveToMongoDB(req_original_url, req_short_url);
    }
  });
});

app.get('/api/:short_url', function(req, res) {
  console.log('Searching DB for ' + req.params.short_url);
  ShortURL.findOne({ shortURL: req.params.short_url }, function(err, shortURLObj) {
    if (err !== null) {
      console.log(err);
      console.log('Accessing DB failed...')
    } else {
      console.log('Accessing DB successful...')
      console.log(shortURLObj);
      console.log('Accessing ShortURL: ' + shortURLObj.shortURL + '\nRedirecting to FullURL: ' + shortURLObj.fullURL);
      
      res.redirect(shortURLObj.fullURL)
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
