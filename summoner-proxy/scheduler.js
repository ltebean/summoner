var workers=require('./workers');

var jobs={} //jobId:cb

exports.addJob=function(options){
	var req=options.req;
	var timeout=options.timeout||5000;

	var jobId = req.url+Date.parse(new Date());

	jobs[jobId]=options.done;
	
	var job={
		jobId:jobId,
		request:{
			url:req.url,
			method:req.method,
			headers:req.headers,
			body:req.body
		}
	}
	console.log('apply job: %s',JSON.stringify(job));
	workers.sendJob(job);

	setTimeout(function(){
		jobs[jobId] && jobDone({
			jobId:jobId,
			response:{
				code:503,
				headers:{},
				body:'',
			}
		});
	},timeout);

	
}

var jobDone=function(result){
	console.log('jobdone:');
	console.log(result);
	var jobId=result.jobId;
	jobs[jobId] && jobs[jobId](result.response) && delete jobs[jobId];
} 

exports.jobDone=jobDone;