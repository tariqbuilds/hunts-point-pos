 var pos = angular.module('POS', ['ngRoute']);

////////////////// Routing /////////////////////////////

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
          }).
          otherwise({
            redirectTo: '/'
          });
          
    }]);

///////////////////////////////////////////////////
//////////////////  Services  ////////////////// //
////////////////////////////////////////////////////

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
        console.log('saving form');
        scope.onSave({ product: scope.product });
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
      console.log(product);
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