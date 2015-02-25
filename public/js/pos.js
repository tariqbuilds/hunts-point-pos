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
          when('/inventory/item/new', {
            templateUrl: 'templates/inventory/new-item.html',
            controller: 'newItemController',
          }).
          when('/inventory/item/:itemId', {
            templateUrl: 'templates/inventory.html',
            controller: 'editItemController',
          }).
          
          when('/pos', {
            templateUrl: 'templates/pos.html',
          }).
          otherwise({
            redirectTo: '/'
          });
          
    }]);

////////////////// Controllers //////////////////

pos.controller('body', function ($scope) {
});

// Inventory Section

pos.controller('inventoryController', function ($scope) {

  $scope.inventory = [
    {
      id: 48,
      name: "Product 1",
      price: 13.21,
      quanity_on_hand: 259,
    },
    {
      id: 21,
      name: "Product 2",
      price: 25.34,
      quanity_on_hand: 2,
    },
    {
      id: 32,
      name: "Product 3",
      price: 32.00,
      quanity_on_hand: 15,
    },
  ];
});

pos.controller('newItemController', function ($scope) {

});