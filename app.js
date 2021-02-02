const express = require("express");
const cors = require("cors");
const env = require("./env");
const axios = require("axios");
const flickr = require("flickr-sdk");
const morgan = require("morgan");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

var oauth = new flickr.OAuth(env.key, env.secret);
var token = '';
var verifier = '';
var token_secret = '';

app.get("/request", (req, res) => {
  // During the local development, use ngrok to get a url for localhost's callback url
  // Use that url as the callback url 
  const callbackURL = "https://69eb13276664.ngrok.io/callback";
  oauth
    .request(callbackURL)
    .then((response) => {
      token = response.text.split("&")[1].split('=')[1];
      token_secret = response.text.split('&')[2].split('=')[1];
      console.log(response.text);
      var url = oauth.authorizeUrl(token);
      console.log("URL", url);
      res.status(200).json({ status: true, data: url });
    })
    .catch((err) => {
      console.log(err);
      res.status(200).json({ status: true, data: err })
    });
});

app.get("/callback", (req, res) => {
  const params = req.query;
  verifier = params.oauth_verifier;
  oauth.verify(token, verifier, token_secret)
    .then(response => {
      const [FULLNAME, TOKEN, SECRET, UID, USERNAME] = response.text.split('&');
      token = TOKEN.split('=')[1];
      token_secret = SECRET.split('=')[1];
      const info = {
	fullname: decodeURIComponent(FULLNAME.split('=')[1]),
	username: decodeURIComponent(USERNAME.split('=')[1]),
	userId: decodeURIComponent(UID.split('=')[1]),
	token:token,
	token_secret:token_secret
      };
      res.status(200).json({ status: true, data: info });
    })
    .catch(err => {
      res.status(500).json({ status: false, data: err });
    });
});

module.exports = app;
