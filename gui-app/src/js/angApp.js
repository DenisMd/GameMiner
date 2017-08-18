const packageInfo = require("./package");
const {app} = require('electron').remote;

var mainApp = angular.module('game-miner-app', ['ui.router']);

mainApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('initialize', {
            url: '/',
            templateUrl: 'pages/initialize.html',
            controller: 'StartCtrl'
        })
        .state('error', {
            url: '/error',
            templateUrl: 'pages/error.html',
            controller: 'ErrorCtrl',
            params: {
                error: null
            }
        })

});

function prepareError(e) {
    if (e.status === 429) {
        return {
            error: {
                icon: 'clock-o ',
                header: "Превышен лимит запросов",
                message: "С вашего IP-адреса превышен лимит запросов к серверу. Повторите попытку позже"
            }
        };
    } else {
            return {
                error: {
                    icon: 'warning',
                    header: "Отсутсвует подключение к серверу",
                    message: "Проверьте ваше подключение к интернету или повторите попытку позже"
                }
        };
    }
}

mainApp.controller('MainCtrl', function MainController($scope) {
    $scope.version = packageInfo.version;
});

mainApp.controller('StartCtrl', function StartController($scope, $state, $http) {
    $http.get(`${packageInfo.externalServer}/info`)
        .then(function(response) {
            let data = response.data;
            if (data.engineeringWorks === true) {
                $state.go('error', {
                    error: {
                        icon: 'clock-o ',
                        header: "Технические работы",
                        message: data.engineeringWorksMess
                    }
                });
            }
            $scope.appPath = app.getPath('userData');
        }).catch((e) => {
            $state.go('error', prepareError(e));
        });
});


mainApp.controller('ErrorCtrl', function ErrorController($scope, $state, $stateParams) {
    $scope.error = $stateParams.error;
    $scope.reconnect = function () {
        $state.go('initialize');
    }
});