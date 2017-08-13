const packageInfo = require("./package");

var mainApp = angular.module('game-miner-app', ['ui.router']);

mainApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('initialize', {
            url: '/',
            templateUrl: 'pages/initialize.html'
        })

});

mainApp.controller('MainCtrl', function PhoneListController($scope,$http) {
    $scope.version = packageInfo.version;

    $http.get(`${packageInfo.externalServer}/info`)
        .then(function(response) {
            $scope.serverInfo = response.data;
        });
});