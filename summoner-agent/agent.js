
var workerId=createWorkerId();

function createWorkerId(){
	return 1;
}

initSocketConnection();

function initSocketConnection(){

	var socket = io.connect('http://localhost:9000');

	socket.on('connect',function(){
		console.log('connected');

		socket.emit('register',1);

		socket.on('job:arrive', function (job) {
			console.log('job:arrive');
			console.log(job);
			$.ajax({
			    type: job.request.method,
			    url: job.request.url
			}).done(function( data ) {
			    var result={
			   		jobId:job.jobId,
			   		response:{
			   			code:200,
			   			headers:{},
			   			body:data
			   		}
			   	}
			   	console.log('job:done');
			   	console.log(result)
			    socket.emit('job:done', result);
			}).fail(function(){
			    socket.emit('job:done', {
					jobId:job.jobId,
					response:{
			   			code:500,
			   			headers:{},
			   			body:''
			   		}
			    });
			});	   	
		});

		socket.on('disconnect', function () {
			
	  	});

	})
		
}

