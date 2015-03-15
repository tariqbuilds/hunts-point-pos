var app 	= require('express')()
var server 	= require('http').Server(app)
var bodyParser = require('body-parser')
var Datastore = require('nedb')

var Inventory = require('./inventory');

app.use(bodyParser.json())

module.exports = app

// Database stuff
var Transactions = new Datastore({ 
	filename: './server/databases/transactions.db', 
	autoload: true 
})

app.get('/', function (req, res) {
	res.send('Transactions API')
})

// GET all transactions
app.get('/all', function (req, res) {

	Transactions.find({}, function (err, docs) {
		res.send(docs)
	})
})

// GET all transactions
app.get('/limit', function (req, res) {

	var limit = parseInt(req.query.limit, 10)
	if (!limit) limit = 5

	Transactions.find({}).limit(limit).exec(function (err, docs) {
	  res.send(docs)
	})
})

// GET single transaction
app.get('/:transactionId', function (req, res) {

	Transactions.find({ _id: req.params.transactionId }, function (err, doc) {
		if (doc)
			res.send(doc[0])
	})
})

// Add new transaction
app.post('/new', function (req, res) {

	var newTransaction = req.body
	
	Transactions.insert(newTransaction, function (err, transaction) {
		if (err) 
			res.status(500).send(err)
		else {
			res.sendStatus(200)
			Inventory.decrementInventory(transaction.products)
		} 
	})
})