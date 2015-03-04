var express = require('express');
var app 	= require('express')();
var server 	= require('http').Server(app);
var path 	= require('path');
var Datastore = require('nedb');

module.exports = app;

// Database stuff
var inventoryDB = new Datastore({ filename: './server/databases/inventory.db', autoload: true });

// GET all inventory items
app.get('/', function (req, res) {

	inventoryDB.find({}, function (err, docs) {
		res.send(docs);
	});

});

app.get('/', function (req, res) {

	inventoryDB.find({}, function (err, docs) {
		res.send(docs);
	});

});