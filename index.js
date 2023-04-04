require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns_ = require('dns');

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

app.post('/', bodyParser.urlencoded({extended: false}))

app.post('/api/shorturl', function(req, res) {
  let invalidURLObj = {error: 'invalid url'};
  let req_original_url = req.body.url;
  let shortURLObj = {
    original_url: req_original_url,
    short_url: ''
  };

  console.log(req_original_url);

  dns_.lookup(req_original_url, (err, addresses) => {
    console.log(addresses)
  });

  // res.json(invalidURLObj);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
