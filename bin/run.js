'use strict';

var Roboat = require('../lib/roboat');

if(process.env.BOT_API_KEY == null)
	throw new Error("BOT_API_KEY not set");
	
var token = process.env.BOT_API_KEY.trim();
var name = process.env.BOT_NAME;


var roboat = new Roboat({
	token: token,
	name: name
});

roboat.run();