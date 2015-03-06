 var pos = angular.module('POS', ['ngRoute']);

///////////////////////////////////////////////////
//////////////////  Routing  ////////////////// //
//////////////////////////////////////////////////

pos.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.
          when('/', {
            templateUrl: 'templates/home.html',
          }).
          
          when('/inventory', {
            templateUrl: 'templates/inventory.html',
            controller: 'inventoryController',
          }).
          when('/inventory/create-product', {
            templateUrl: 'templates/inventory/create-product.html',
            controller: 'newProductController',
          }).
          when('/inventory/product/:productId', {
            templateUrl: 'templates/inventory/edit-product.html',
            controller: 'editProductController',
          }).
          when('/pos', {
            templateUrl: 'templates/pos.html',
            controller: 'posController',
          }).
          otherwise({
            redirectTo: '/'
          });
          
    }]);

///////////////////////////////////////////////////
//////////////////  Services  ////////////////// //
////////////////////////////////////////////////////

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

pos.service('Inventory', ['$http', function ($http) {

    var apiInventoryAddress = '/api/inventory';

    this.getProducts = function () {
        return $http.get(apiInventoryAddress + '/products').then(function (res) {
          return res.data;
        });
    };

    this.getProduct = function (productId) {
        return $http.get(apiInventoryAddress + '/product', {
          params: { id: productId }
        }).then(function (res) {
          return res.data;
        });
    };

    this.updateProduct = function (product) {
        return $http.put(apiInventoryAddress + '/product', product).then(function (res) {
          return res.data;
        });
    };

    this.createProduct = function (newProduct) {
        return $http.post(apiInventoryAddress + '/product', newProduct).then(function (res) {
          return res.data;
        });
    };

}]);


///////////////////////////////////////////////////
////////////////// Directives ////////////////// //
////////////////////////////////////////////////////

pos.directive('productForm',function ($location) {
  return {
    restrict: 'E',
    scope: {
      product: '=',
      onSave: '&'
    },
    templateUrl: 'templates/directives/product-form.html',
    link: function (scope, el) {

      // highlight barcode field
      el.find('form').eq(0).find('input').eq(0).select();

      scope.save = function () {
        scope.onSave({ product: scope.product });
      };

    }
  };

});

pos.directive('barcodeScanner',function ($location) {
  return {
    restrict: 'E',
    scope: {
      addProduct: '&',
      validateProduct: '&',
    },
    templateUrl: 'templates/directives/barcode-scanner.html',
    link: function (scope, el) {
      
      var $barcodeField = el.find('input');

      $barcodeField.focus();
      
      scope.clearBarcode = function () {
        $barcodeField.val('');
        return true;
      };

    }
  };

});

pos.directive('addManualItem',function () {
  return {
    restrict: 'E',
    scope: {
      addItem: '&'
    },
    templateUrl: 'templates/directives/add-manual-item.html',
    link: function (scope, el) {
      
      scope.add = function () {
        scope.manualItem.name = "----";
        scope.addItem({item: scope.manualItem});
        el.find('div').eq(0).modal('hide');
        scope.manualItem = '';
      };

    }
  };

});

pos.directive('checkout',function () {
  return {
    restrict: 'E',
    scope: {
      sendReceipt: '&',
      cartTotal: '='
    },
    templateUrl: 'templates/directives/checkout.html',
    link: function (scope, el) {
      
      scope.getChangeDue = function () {
        if (scope.paymentAmount && scope.paymentAmount > scope.cartTotal) {
          var change =  parseFloat(scope.paymentAmount) - parseFloat(scope.cartTotal);
          return change;
        }
        else 
          return 0;
      };

    }
  };

});

/////////////////////////////////////////////////////
////////////////// Controllers ////////////////// //
////////////////////////////////////////////////////

pos.controller('body', function ($scope) {
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

pos.controller('newProductController', function ($scope, $location, Inventory) {
  
  $scope.createProduct = function (product) {
    
    Inventory.createProduct($scope.newProduct).then(function (product) {
    });

    $location.path('/inventory');
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

});

// POS Section
pos.controller('posController', function ($scope, $location, Inventory) {

  $scope.cart = {
    products: [],
    total: 0,
  };

  $scope.refreshInventory = function () {
    Inventory.getProducts().then(function (products) {
      $scope.inventory = angular.copy(products);
      $scope.inventoryLastUpdated = new Date();
    });
  };

  $scope.refreshInventory();

  var addProductAndUpdateCart = function (product) {
    $scope.cart.products = $scope.cart.products.concat([product]);
    $scope.updateCartTotal();
    $scope.barcode = '';
  };

  $scope.addProductToCart = function (barcode) {
    var product = $scope.isValidProduct(barcode);
    product.quantity = 1;
    addProductAndUpdateCart(product);
  };

  $scope.addManualItem = function (product) {
    product.quantity = 1;
    console.log(product);
    addProductAndUpdateCart(product);
  };

  $scope.removeProductFromCart = function (productIndex) {
    $scope.cart.products.remove(productIndex);
    $scope.updateCartTotal();
  };

  $scope.isValidProduct = function (barcode) {
    var result = angular.copy(_.find($scope.inventory, { barcode: barcode.toString() }));
    return result;
  };

  $scope.updateCartTotal = function () {
    $scope.cart.total = _.reduce($scope.cart.products, function (total, product) {
      return total + ( parseFloat(product.price * product.quantity) );
    }, 0);
  };

});