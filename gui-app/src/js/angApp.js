
const packageInfo = require("../package");


var mainApp = angular.module('game-miner-app', ['ui.router']);



mainApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('red', {
            url: '/red',
            templateUrl: 'pages/red.html'
        })

});


mainApp.controller('MainCtrl', function PhoneListController($scope,$http) {
    $scope.version = packageInfo.version;

    $http.get("http://localhost:13555/info")
        .then(function(response) {
            $scope.serverInfo = response.data;
        });
});



