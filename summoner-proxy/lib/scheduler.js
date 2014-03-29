var Worker = require('../lib/worker');
var Job = require('../lib/Job');
var logger = require('../lib/logger');

var jobs = {} //jobId: job

var workers = {} // workerId: worker

exports.registerWorker = function(worker) {
	workers[worker.id] = worker;
	worker.on('done', function(result) {
		//fetch the job by id
		var jobId = result.jobId
		var job = jobs[jobId];
		if (!job) {
			return;
		}
		job.success(result.response);
		jobs[jobId] && delete jobs[jobId];
	});
	logger.info('worker registered: %s',worker.id);
}

exports.removeWorker = function(worker) {
	delete workers[worker.id];
	logger.info('worker removed: %s',worker.id);
}

exports.scheduleJob = function(job) {
	// register job with jobId
	var jobId = job.data.jobId
	jobs[jobId] = job;
	// fetch a worker to do the job
	var worker = fetch_random(workers);
	if(!worker){
		job.fail('no worker');
		return;
	}
	worker.doJob(job);
	// in case the worker fails
	setTimeout(function(){
		var job= jobs[jobId]
		if(!job){
			return;
		}
		job.fail('timeout');
	},2000);

	logger.debug('current jobs: ' + Object.keys(jobs));
}

function fetch_random(obj) {
	var temp_key, keys = [];
	for (temp_key in obj) {
		if (obj.hasOwnProperty(temp_key)) {
			keys.push(temp_key);
		}
	}
	var key = keys[Math.floor(Math.random() * keys.length)];
	return obj[key]
}