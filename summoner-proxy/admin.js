var express = require('express');
var http = require('http');
var workers = require('./lib/workers');

//admin server
var adminApp = express();
adminApp.configure(function() {
    adminApp.use(express.cookieParser());
    adminApp.use(express.bodyParser());  
    adminApp.use('/public', express.static(__dirname + '/public'));
    adminApp.use(adminApp.router);
});

var adminServer = http.createServer(adminApp);

adminApp.get('/',function (req,res){
    res.sendfile(__dirname+'/public/index.html')
});

adminApp.get('/api/workers',function(req,res){
    res.json(require('./workers').getWorkers());
})

exports.startOnPort=function(port){
    adminServer.listen(port);
}