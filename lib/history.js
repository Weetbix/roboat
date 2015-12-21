// http://history.muffinlabs.com/ API wrapper
var http = require("http");
var async = require("async");
var _ = require("underscore");
var Q = require('q');

// returns a promise
exports.getRandomHistoryItemForDate = function(day, month)
{
	var url = "http://history.muffinlabs.com/date/" + month + "/" + day;

	var defer = Q.defer();
	http.get(url, function(response){
		var data = '';
	
		response.on('data', function (chunk){
			data += chunk;
		});
	
		response.on('end',function(){
			var obj = JSON.parse(data);
			defer.resolve(_.sample(obj.data.Events));
		})
	});
	
	return defer.promise;
}