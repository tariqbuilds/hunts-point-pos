var app 	= require('express')()
var server 	= require('http').Server(app)
var bodyParser = require('body-parser')
var Datastore = require('nedb')

app.use(bodyParser.json())

module.exports = app

// Database stuff
var inventoryDB = new Datastore({ 
	filename: './server/databases/inventory.db', 
	autoload: true 
})

// GET inventory
app.get('/', function (req, res) {
	res.send('Inventory API')
})

// GET a product from inventory by _id
app.get('/product', function (req, res) {
	
	if (!req.query.id) {
		res.status(500).send('ID field is required.')
	}
	else {
		inventoryDB.findOne({_id: req.query.id}, function (err, product) {
			res.send(product)
		});
	}

})

// GET all inventory items
app.get('/products', function (req, res) {

	inventoryDB.find({}, function (err, docs) {
		res.send(docs)
	})
})

// Create inventory product
app.post('/product', function (req, res) {

	var newProduct = req.body
	
	inventoryDB.insert(newProduct, function (err, product) {
		if (err) 
			res.status(500).send(err)
		else 
			res.send(product)
	})
})

// Update inventory product
app.put('/product', function (req, res) {

	var productId = req.body._id
	
	inventoryDB.update({ _id: productId }, req.body, {}, function (err, numReplaced, product) {
		
		if (err) 
			res.status(500).send(err)
		else
			res.sendStatus(200)
		
	});

})