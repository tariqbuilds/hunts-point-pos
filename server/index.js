var express = require('express');
var app 	= require('express')();
var server 	= require('http').Server(app);
var path 	= require('path');
var bodyParser = require('body-parser');

server.listen(80, function () { console.log('POS Server Started!'); });

var publicPath = '/../public/';


app.use(express.static(path.resolve(__dirname + publicPath)));
app.use(express.static(path.resolve(__dirname + '/../bower_components')));

app.get('/', function (req, res) {
	res.sendFile(path.resolve(__dirname, publicPath, 'index.html'));
});

app.use('/api', require('./api'));