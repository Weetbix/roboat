'use strict';

var Roboat = require('../lib/roboat');

var token = process.env.BOT_API_KEY.trim();
var name = process.env.BOT_NAME;

var roboat = new Roboat({
	token: token,
	name: name
});

roboat.run();