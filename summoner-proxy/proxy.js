var express = require('express');
var http = require('http');
var Worker = require('./lib/worker');
var scheduler = require('./lib/scheduler');
var logger = require('./lib/logger');
var Job = require('./lib/job');

//proxy server
var proxyApp = express();
proxyApp.configure(function() {
    proxyApp.use(function handleProxy(req, res, next) {
        var job = new Job(req);
        job.on('success', function(response) {
            return res.send(response.code, response.body);
        }).on('fail', function(cause) {
            return res.send(500, cause);
        })
        scheduler.scheduleJob(job);
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

    var worker;

    socket.on('register', function(id) {
        worker = new Worker(id);
        scheduler.registerWorker(worker);
        worker.on('job', function(job) {
            logger.info('send job: %s', job.jobId)
            //console.log(job);
            socket.emit('job:arrive', job);
        })
    });

    socket.on('job:done', function(result) {
        logger.info('job done: %s - %d', result.jobId, result.response.code);
        worker.jobDone(result);
    })

    socket.on('disconnect', function() {
        scheduler.removeWorker(worker);
    });
});


exports.startOnPort = function(port) {
    proxyServer.listen(port);
}