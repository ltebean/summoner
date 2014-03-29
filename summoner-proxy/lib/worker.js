var util = require("util");
var events = require("events");

function Worker(workerId){
	this.id=workerId;
}

util.inherits(Worker, events.EventEmitter);

Worker.prototype.doJob = function(job) {
	this.emit('job',job.data);
	return this;
};

Worker.prototype.jobDone = function(result) {
	this.emit('done',result);
	return this;
};

module.exports=Worker;
