var pos = angular.module('POS', ['ngRoute']);


///////////////////////////////////////////////////
////////////////// Socket.io ////////////////// //
//////////////////////////////////////////////////

var serverAddress;

if (window.location.host === 'pos.dev')
  serverAddress = 'http://pos.dev'
else
  serverAddress = 'http://pos.afaqtariq.com:8080';

var socket = io.connect(serverAddress);


/////////////////////////////////////////////////////
////////////////// Controllers ////////////////// //
////////////////////////////////////////////////////

pos.controller('body', function ($scope, Settings) {
  
  Settings.get().then(function (settings) {
    $scope.settings = settings;
  });

});

// Inventory Section

pos.controller('inventoryController', function ($scope, $location, Inventory) {

  // get and set inventory
  Inventory.getProducts().then(function (products) {
    $scope.inventory = angular.copy(products);
  });

  // go to edit page
  $scope.editProduct = function (productId) {
    $location.path('/inventory/product/' + productId);
  };

});

pos.controller('newProductController', function ($scope, $location, $route, Inventory) {
  
  $scope.addMultipleProducts = false;

  $scope.createProduct = function (product) {
    
    Inventory.createProduct($scope.newProduct).then(function (product) {

      if ($scope.addMultipleProducts) refreshForm();
      else $location.path('/inventory');
      
    });

  };

  var refreshForm = function () {
    $scope.newProuct = {};
  };

});

pos.controller('editProductController', function ($scope, $location, $routeParams, Inventory) {
    
  // get and set inventory
  Inventory.getProduct($routeParams.productId).then(function (product) {
    $scope.product = angular.copy(product);
  });

  $scope.saveProduct = function (product) {
    
    Inventory.updateProduct(product).then(function (updatedProduct) {
      console.log('updated!');
    });

    $location.path('/inventory');
  };

  $scope.deleteProduct = function () {
    Inventory.removeProduct($scope.product._id).then(function () {
      $location.path('/inventory');
    });
  };

});

// POS Section
pos.controller('posController', function ($scope, $location, Inventory, Transactions) {

  $scope.barcode = '';
  
  function barcodeHandler (e) {
      
      $scope.barcodeNotFoundError = false;

      // if enter is pressed
      if (e.which === 13) {
        
        // if the barcode accumulated so far is valid, add product to cart
        if ($scope.isValidProduct($scope.barcode)) $scope.addProductToCart($scope.barcode);
        else 
          console.log('invalid barcode: ' + $scope.barcode);
          // $scope.barcodeNotFoundError = true;

        $scope.barcode = '';
        $scope.$digest();
      } 
      else {
        $scope.barcode += String.fromCharCode(e.which);
      }

  }

  $(document).on('keypress', barcodeHandler);

  var rawCart = {
    products: [],
    total: 0,
    total_tax: 0,
  };

  var startCart = function () {
    var cartJSON = localStorage.getItem('cart');

    if (cartJSON) {
      $scope.cart = JSON.parse(cartJSON);
    }
    else {
      $scope.cart = angular.copy(rawCart);
    }

  };

  var startFreshCart = function () {
      localStorage.removeItem('cart');
      $scope.cart = angular.copy(rawCart);
      $scope.updateCartTotals();
      $('#barcode').focus();
  };

  $scope.refreshInventory = function () {
    Inventory.getProducts().then(function (products) {
      $scope.inventory = angular.copy(products);
      $scope.inventoryLastUpdated = new Date();
    });
  };

  $scope.refreshInventory();

  startCart();
  
  var addProductAndUpdateCart = function (product) {
    $scope.cart.products = $scope.cart.products.concat([product]);
    $scope.updateCartTotals();
    $scope.barcode = '';
  };

  $scope.cleanProduct = function (product) {
    product.cart_item_id = $scope.cart.products.length + 1;

    if (product.food) product.tax_percent = 0;
    else product.tax_percent = .08 ;

    delete product.quantity_on_hand;
    delete product.food;
    return product;
  };

  var productAlreadyInCart = function (barcode) {
    var product = _.find($scope.cart.products, { barcode: barcode.toString() });
    
    if (product) {
      product.quantity = product.quantity + 1;
      $scope.updateCartTotals();
    }

    return product;
  };

  $scope.addProductToCart = function (barcode) {
    
    if (productAlreadyInCart(barcode)) return;
    else {
      var product = angular.copy(_.find($scope.inventory, { barcode: barcode.toString() }));
      product = $scope.cleanProduct(product);
      product.quantity = 1;
      addProductAndUpdateCart(product);
    }
  };

  $scope.addManualItem = function (product) {
    product.quantity = 1;
    product = $scope.cleanProduct(product)
    addProductAndUpdateCart(product);
  };

  $scope.removeProductFromCart = function (productIndex) {
    $scope.cart.products.remove(productIndex);
    $scope.updateCartTotals();
  };

  $scope.isValidProduct = function (barcode) {
    return _.find($scope.inventory, { barcode: barcode.toString() });
  };

  var updateCartInLocalStorage = function () {
    var cartJSON = JSON.stringify($scope.cart);
    localStorage.setItem('cart', cartJSON);
    socket.emit('update-live-cart', $scope.cart);
  };

  $scope.updateCartTotals = function () {
    $scope.cart.total = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat( product.price * product.quantity );
      var weightedTax = parseFloat( weightedPrice * product.tax_percent );
      var weightedPricePlusTax = weightedPrice + weightedTax;
      return total + weightedPricePlusTax;
    }, 0);

    $scope.cart.total_tax = _.reduce($scope.cart.products, function (total, product) {
      var weightedPrice = parseFloat( product.price * product.quantity );
      var weightedTax = parseFloat( weightedPrice * product.tax_percent );
      return total + weightedTax;
    }, 0);

    updateCartInLocalStorage();
  };

  $scope.printReceipt = function (payment) {
    // print receipt
    var cart = angular.copy($scope.cart);
    cart.payment = angular.copy(payment);
    cart.date = new Date();

    // save to database
    Transactions.add(cart).then(function (res) {

      socket.emit('cart-transaction-complete', {});

      // clear cart and start fresh
      startFreshCart();
      
    });

    $scope.refreshInventory();
  };

  $scope.addQuantity = function (product) {
    product.quantity = parseInt(product.quantity) + 1;
    $scope.updateCartTotals();
  };

  $scope.removeQuantity = function (product) {
    if (parseInt(product.quantity) > 1) {
      product.quantity = parseInt(product.quantity) - 1;
      $scope.updateCartTotals();
    }
  };

});

pos.controller('transactionsController', function ($scope, $location, Transactions) {
    
  Transactions.getAll().then(function (transactions) {
    $scope.transactions = _.sortBy(transactions, 'date').reverse();
  });

  $scope.getNumberOfProducts = function (products) {
    return _.reduce(products, function (s, product) {
      return s + product.quantity;
    }, 0);
  };

});

pos.controller('viewTransactionController', function ($scope, $routeParams, Transactions) {
  
  var transactionId = $routeParams.transactionId;

  Transactions.getOne(transactionId).then(function (transaction) {
    $scope.transaction = angular.copy(transaction);
  });

});

pos.controller('liveCartController', function ($scope, Transactions, Settings) {
  
  $scope.recentTransactions = [];
  
  var getRecentTransactions = function () {
    Transactions.getAll().then(function (transactions) {
      $scope.recentTransactions = _.sortBy(transactions, 'date').reverse();
    });
  };

  // tell the server the page was loaded.
  // the server will them emit update-live-cart-display
  socket.emit('live-cart-page-loaded', { forreal: true });

  // update the live cart and recent transactions
  socket.on('update-live-cart-display', function (liveCart) {
    $scope.liveCart = liveCart;
    getRecentTransactions();
    $scope.$digest();
  });

});
