var util = require("util");
var events = require("events");

function Job(req) {
	this.data={
		jobId :req.url + '@' + Date.parse(new Date()),
		request : {
			url: req.url,
			method: req.method,
			headers: req.headers,
			body: req.body
		}
	}
}

util.inherits(Job, events.EventEmitter);

Job.prototype.success = function(data) {
	this.emit('success', data);
	return this;
};

Job.prototype.fail = function(cause) {
	this.emit('fail', cause);
	return this;
};

module.exports = Job;