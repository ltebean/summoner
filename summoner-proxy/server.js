var express = require('express');
var http = require('http');
var workers = require('./workers');
var scheduler = require('./scheduler');

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
proxyServer.listen(9000);

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
            console.log('send job: %s', job.jobId);
            //console.log(job);
            socket.emit('job:arrive', job);
        });
    });

    socket.on('job:done', function(result) {
        console.log('job done: %s', result.jobId);
        scheduler.jobDone(result);
    })

    socket.on('disconnect', function() {
        workers.remove(workerId);
    });
});


//admin server
var adminApp = express();
adminApp.configure(function() {
    adminApp.use(express.cookieParser());
    adminApp.use(express.bodyParser());  
    adminApp.use('/public', express.static(__dirname + '/public'));
    adminApp.use(adminApp.router);
});

var adminServer = http.createServer(adminApp);
adminServer.listen(3000);

adminApp.get('/',function (req,res){
    res.sendfile(__dirname+'/public/index.html')
});

adminApp.get('/api/workers',function(req,res){
    res.json(require('./workers').getWorkers());
})