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

// GET transactions for date
app.get('/by-date', function (req, res) {
	
	var startDate = new Date(2015, 2, 15);
	startDate.setHours(0,0,0,0);

	var endDate = new Date(2015, 2, 15);
	endDate.setHours(23,59,59,999);

	Transactions.find({ date: { $gte: startDate.toJSON(), $lte: endDate.toJSON() } }, function (err, docs) {
		if (docs)
			res.send(docs)
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

// GET single transaction
app.get('/:transactionId', function (req, res) {

	Transactions.find({ _id: req.params.transactionId }, function (err, doc) {
		if (doc)
			res.send(doc[0])
	})
})

