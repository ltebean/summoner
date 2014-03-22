var workers={};

exports.register=function(workerId,sender){
	workers[workerId]=sender;
	console.log('worker registered with %s',workerId);
}

exports.sendJob=function(job){
	console.log('current workers:')
	console.log(workers);
	if(!Object.keys(workers)[0]){
		return;
	}

	var workerId=Object.keys(workers)[0]
	console.log('pick worker: '+workerId);
	workers[workerId] && workers[workerId](job);
}

exports.remove=function(workerId){
	delete workers[workerId];
}