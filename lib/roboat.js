'use strict';

var util = require("util");
var slackbots = require("slackbots");
var async = require("async");
var Twitter = require("twitter");
var S = require("string");
var randomwords = require("random-words");
var Q = require("q");
var schedule = require("node-schedule");

var roboat_settings = require("./settings");
var history = require("./history.js");


var Roboat = function Constructor(settings){
	this.settings = settings;
	this.settings.name = this.settings.name || "roboat";
	this.user = null;
	this.user_john = null;
	
	this.twitter_client = new Twitter(settings.twitter_settings);	
	
	console.log("time: " + new Date().toTimeString());
};

util.inherits(Roboat, slackbots);

Roboat.prototype.run = function(){
	// Call the slackbots contructor
	Roboat.super_.call(this, this.settings);
	
	this.on('start', this._onStart);
	
	this.on('message', this._reactToInterestingMessages);
	this.on('message', this._respondToPrivateMessages);
	this.on('message', this._respondToTweetRequests);
	this.on('message', this._respondToHistoryRequests);
	this.on('message', this._respondToHelpMessages);
	
	// Post daily facts about what happened
	schedule.
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

// Thumbs up messages that contain robotic goodness
Roboat.prototype._reactToInterestingMessages = function(message){
	if(this._isChatMessage(message) &&
	   !this._isMessageFromRoboat(message))
	{
		var self = this;
		async.any(roboat_settings.thumbsUpStrings, 
			function(string, cb){
				return cb(S(message.text.toLowerCase()).contains(string));
			},
			function(result){
				if(result){
					self._reactToMessage(message, "thumbsup")
						.fail(function(err){
							console.log("Error reacting: " + JSON.stringify(err));
						});
				}
			});
	}
};

Roboat.prototype._respondToPrivateMessages = function(message){
	if(this._isChatMessage(message) &&
	   this._isMessageInPrivateChannel(message) &&
	   !this._isMessageFromRoboat(message))
	{
		var response = "Hi. I'm a robot. 1010110.\n" +
					   "I don't do much at the moment but you can tinker with my circuit boards on <https://github.com/Weetbix/roboat|GitHub>\n" +
					   "Type \"roboat help\" to peek at my fuse box";
					   
		this.postMessage(message.channel, response, { as_user: true });
	}
}

Roboat.prototype._respondToHelpMessages = function(message){
	if(this._isChatMessage(message) &&
	   S(message.text.toLowerCase()).contains('help') &&
	   S(message.text.toLowerCase()).contains('roboat') &&
	   !this._isMessageFromRoboat(message))
	{
		var response = "Say my `name` and one of these words:\n" + 
					   "`tweet`: calculate a popular tweet\n" +
					   "`history`: calculate previous human events on this day\n";
					   
		this.postMessage(message.channel, response, { as_user: true });
	}
}

Roboat.prototype._respondToTweetRequests = function(message){
	// Respond if the message contains "roboat" and "tweet"
	if(this._isChatMessage(message) &&
	   !this._isMessageFromRoboat(message) &&
	   S(message.text.toLowerCase()).contains('tweet') &&
	   S(message.text.toLowerCase()).contains('roboat'))
	{
		var self = this;
		var tweet_query = randomwords();
		
		this._getSingleTweet(tweet_query)
		.then(function(tweet){
			var reply = "Calculating *" + tweet_query + "*.\n";
			reply += ">>>" + tweet.text + "\n";
			reply += "*" + tweet.user.name + "*, " + (new Date(tweet.created_at)).toDateString();
			return reply;
		}, function(err){
			console.log("Error getting tweets for: " + tweet_query + "\n" + err);
			return "*BZZtZapZang1010*. Something went wrong.";
		})
		.then(function(reply){
			self.postMessage(message.channel, reply, { as_user: true });
		})
		.done();
	}
}

Roboat.prototype._respondToHistoryRequests = function(message){
	// Respond if the message contains "roboat" and "history"
	if(this._isChatMessage(message) &&
	   !this._isMessageFromRoboat(message) &&
	   S(message.text.toLowerCase()).contains('history') &&
	   S(message.text.toLowerCase()).contains('roboat'))
	{
		this._postOnThisDayMessage(message.channel);
	}
}

Roboat.prototype._postOnThisDayMessage = function(channel)
{
	var self = this;
	var now = new Date();
	history.getRandomHistoryItemForDate(now.getDay(), now.getMonth())
			.then(function(eventJson){
				var reply = "*On this day:*\n" +
							"In " + eventJson.year + ", " + eventJson.text;
								
				self.postMessage(channel, reply, { as_user: true });
			});
}

// Returns a promise
Roboat.prototype._getSingleTweet = function(query)
{
	var deferred = Q.defer();
	
	this.twitter_client.get(
			'search/tweets',
			{q: query, count: 1, result_type: "popular"},
			function(err, tweets, response) {
				if(err){
					deferred.reject(new Error(err));
				}
				else
				{
					deferred.resolve(tweets.statuses[0]);
				}
			});
			
	return deferred.promise;
}

Roboat.prototype._isChatMessage = function(message){
	return message.type === 'message' && Boolean(message.text);	
};

// Messages from non-private messages have channel id starting with C
Roboat.prototype._isMessageInPublicChannel = function(message){
	return typeof message.channel === 'string' &&
		   message.channel[0] === 'C';
};

// PMs have channel IDs starting with U
Roboat.prototype._isMessageInPrivateChannel = function(message){
	return typeof message.channel === 'string' &&
		   message.channel[0] === 'D';
};

Roboat.prototype._isMessageFromRoboat = function(message){
	return message.user === this.user.id;
}

Roboat.prototype._isFromJohn = function(message){
	return message.user === this.user_john.id;
};

module.exports = Roboat;