var app 	= require('express')()
var server 	= require('http').Server(app)
var bodyParser = require('body-parser')
var Datastore = require('nedb')
var async = require('async')

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
app.get('/product/:productId', function (req, res) {
	
	if (!req.params.productId) {
		res.status(500).send('ID field is required.')
	}
	else {
		inventoryDB.findOne({_id: req.params.productId }, function (err, product) {
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

app.delete('/product/:productId', function (req, res) {
	
	inventoryDB.remove({ _id: req.params.productId }, function (err, numRemoved) {
		if (err) 
			res.status(500).send(err)
		else 
			res.sendStatus(200)
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

app.decrementInventory = function (products) {

	async.eachSeries(products, function (transactionProduct, callback) {
		
		inventoryDB.findOne({_id: transactionProduct._id }, function (err, product) {
			
			// catch manually added items (don't exist in inventory)
			if (!product || !product.quantity_on_hand) {
				callback();
			}

			else {
				var updatedQuantity = parseInt(product.quantity_on_hand) - parseInt(transactionProduct.quantity)
				
				inventoryDB.update({ _id: product._id }, { $set: { quantity_on_hand: updatedQuantity } }, {}, callback)
			}

		});

	});
};