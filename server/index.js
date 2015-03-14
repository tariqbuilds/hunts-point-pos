var express = require('express');
var app 	= require('express')();
var server 	= app.listen(80);
var io = require('socket.io')(server);

var path 	= require('path');
var bodyParser = require('body-parser');
var publicPath = '/../public/';
var liveCart;

app.use(express.static(path.resolve(__dirname + publicPath)));
app.use(express.static(path.resolve(__dirname + '/../bower_components')));

app.get('/', function (req, res) {
	res.sendFile(path.resolve(__dirname, publicPath, 'index.html'));
});

app.use('/api', require('./api'));


// Websocket logic for Live Cart
io.on('connection', function (socket) {

	// upon connecting, make client update live cart
	socket.emit('update-live-cart-display', liveCart);

	// when the cart data is updated by the POS
	socket.on('update-live-cart', function (cartData) {
		
		// keep track of it
		liveCart = cartData;
		
		// broadcast updated live cart to all websocket clients
		socket.broadcast.emit('update-live-cart-display', liveCart);
	});

})