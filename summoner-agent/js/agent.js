
var workerId=createWorkerId();

function createWorkerId(){
	return 1;
}

initSocketConnection();

function initSocketConnection(){

	var socket = io.connect('http://192.168.9.49:9000');

	socket.on('connect',function(){
		console.log('connected');

		var guid=localStorage.guid || Math.uuid(8, 16);
		localStorage.guid=guid;

		socket.emit('register',guid);

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

