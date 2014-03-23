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

	var workerId=fetch_random(workers);
	console.log('pick worker: '+workerId);
	workers[workerId] && workers[workerId](job);
}

function fetch_random(obj) {
    var temp_key, keys = [];
    for(temp_key in obj) {
       if(obj.hasOwnProperty(temp_key)) {
           keys.push(temp_key);
       }
    }
    return keys[Math.floor(Math.random() * keys.length)];
}

exports.remove=function(workerId){
	delete workers[workerId];
}

exports.getWorkers=function(){
	return Object.keys(workers);
}