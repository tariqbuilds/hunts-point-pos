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

pos.controller('inventoryController', function ($scope, $location) {

  // get and set inventory
  $scope.inventory = [
    {
      id: 48,
      name: "Product 1",
      price: 13.21,
      quantity_on_hand: 259,
    },
    {
      id: 21,
      name: "Product 2",
      price: 25.34,
      quantity_on_hand: 2,
    },
    {
      id: 32,
      name: "Product 3",
      price: 32.00,
      quantity_on_hand: 15,
    },
  ];

  // go to edit page
  $scope.editProduct = function (productId) {
    $location.path('/inventory/product/' + productId);
  };

});

pos.controller('newProductController', function ($scope, $location) {
  
  $scope.createProduct = function (product) {
    // call api to create product
    console.log(product);

    // go back to inventory
    $location.path('/inventory');
  };

});

pos.controller('editProductController', function ($scope, $location) {
  
  $scope.saveProduct = function (product) {
    // call api to save product
    console.log(product);

    // go back to inventory
    $location.path('/inventory');
  };

  $scope.product = {barcode: "kjnfkjnkgndk", name: "lsglnl", price: 14.1, quantity_on_hand: 8};

});