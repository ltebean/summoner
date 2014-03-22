var express = require('express');
var http = require('http');
var workers=require('./workers');
var scheduler=require('./scheduler');


var app = express();
app.configure(function() {
	app.use(function(req,res,next){
		scheduler.addJob({
			req:req,
			done:function(response){
				return res.send(response.code,response.body);
			}
		})
	});
});

var server = http.createServer(app);
server.listen(9000);


var io = require('socket.io').listen(server);
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging
io.set('transports', [
    'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
]);

io.sockets.on('connection', function (socket) {

	var workerId;

  	socket.on('register', function (id) {
  		workerId=id
  		workers.register(workerId,function(job){
        console.log('send job:');
        console.log(job);
  			socket.emit('job:arrive',job);
  		});
  	});

  	socket.on('job:done',function(result){
  		scheduler.jobDone(result);
  	})

  	socket.on('disconnect', function () {
    	workers.remove(workerId);
  	});
});