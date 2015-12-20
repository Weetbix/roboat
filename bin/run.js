'use strict';

var Roboat = require('../lib/roboat');

if(process.env.BOT_API_KEY == null)
	throw new Error("BOT_API_KEY not set");
	
var token = process.env.BOT_API_KEY.trim();
var name = process.env.BOT_NAME;

var twitter_settings = 
{
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_TOKEN,
	access_token_secret: process.env.TWITTER_TOKEN_SECRET
};

var roboat = new Roboat({
	token: token,
	name: name,
	twitter_settings: twitter_settings
});

roboat.run();