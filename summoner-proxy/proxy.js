var express = require('express');
var http = require('http');
var workers = require('./lib/workers');
var scheduler = require('./lib/scheduler');
var logger = require('./lib/logger');

//proxy server
var proxyApp = express();
proxyApp.configure(function() {
    proxyApp.use(function handleProxy(req, res, next) {
        scheduler.addJob({
            req: req,
            done: function(response) {
                return res.send(response.code, response.body);
            }
        })
    });
});

var proxyServer = http.createServer(proxyApp);

var io = require('socket.io').listen(proxyServer);
io.enable('browser client minification'); // send minified client
io.enable('browser client etag'); // apply etag caching logic based on version number
io.enable('browser client gzip'); // gzip the file
io.set('log level', 1); // reduce logging
io.set('transports', [
    'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
]);

io.sockets.on('connection', function(socket) {

    var workerId;

    socket.on('register', function(id) {
        workerId = id
        workers.register(workerId, function(job) {
            logger.info('send job: %s', job.jobId)
            //console.log(job);
            socket.emit('job:arrive', job);
        });
    });

    socket.on('job:done', function(result) {
        logger.info('job done: %d %s', result.response.code, result.jobId);
        scheduler.jobDone(result);
    })

    socket.on('disconnect', function() {
        workers.remove(workerId);
    });
});


exports.startOnPort = function(port) {
    proxyServer.listen(port);
}