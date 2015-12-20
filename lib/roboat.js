'use strict';

var util = require("util");
var slackbots = require("slackbots");
var async = require("async");

var Roboat = function Constructor(settings){
	this.settings = settings;
	this.settings.name = this.settings.name || "Roboat";
	this.user = null;
	this.user_john = null;
};

util.inherits(Roboat, slackbots);

Roboat.prototype.run = function(){
	// Call the slackbots contructor
	Roboat.super_.call(this, this.settings);
	
	this.on('start', this._onStart);
	this.on('message', this._onMessage);
};

Roboat.prototype._onStart = function(){
	this._setupUsers();
};

Roboat.prototype._setupUsers = function(){
	// Get the list of users and find ourselves in it
	var self = this;
	
	async.map([self.settings.name, 'john'],
			  function(item, callback){
				  self.getUser(item).then(function(user){
					  return callback(null, user);
				  });
			  },
			  function(err, results){
				  if(err)
				  	return console.log("Couldnt grab a user: " + err);
				
				  self.user = results[0];
				  self.user_john = results[1];	
			  });
};

Roboat.prototype._reactToMessage = function(message, emoji){
	return this._api("reactions.add", 
					{ name: emoji, 
					  channel: message.channel,
					  timestamp: message.ts });
};

Roboat.prototype._onMessage = function(message){
	if(this._isChatMessage(message) && 
	   this._isFromJohn(message))
	{
		this._reactToMessage(message, "thumbsup")
			.fail(function(err){
				console.log("Error reacting: " + JSON.stringify(err));
		});
	}
};

Roboat.prototype._isChatMessage = function(message){
	return message.type === 'message' && Boolean(message.text);	
};

Roboat.prototype._isFromJohn = function(message){
	return message.user == this.user_john.id;
};


module.exports = Roboat;