'use strict';

var Roboat = require('../lib/roboat');

var token = process.env.BOT_API_KEY;
var name = process.env.BOT_NAME;

var roboat = new Roboat({
	token: "xoxb-16684972324-HB5B89jvsCop3D00qJHWmUxI",
	name: name
});

roboat.run();