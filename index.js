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

app.use('/', bodyParser.urlencoded({extended: false}))

function saveToSessionStorage(key, value) {
  sessionStorage.setItem(key, value);
  console.log('short url ' + value + ' saved to key ' + key);
}

app.post('/api/shorturl', function(req, res) {
  let invalidURLObj = {error: 'invalid url'};
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
      saveToSessionStorage(short_url, req_original_url);
    }    
  });
});

app.get('/api/:short_url', function(req, res) {
  let shortURLAddress = sessionStorage.getItem(req.params.short_url);
  console.log(shortURLAddress);
  res.redirect(shortURLAddress);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
