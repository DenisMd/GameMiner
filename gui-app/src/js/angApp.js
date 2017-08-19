const packageInfo = require("./package");
const {app} = require('electron').remote;
const fs = require('fs');

const mainApp = angular.module('game-miner-app', ['ui.router']);

const appConfigPath = app.getPath('userData') + '\\AppConfig\\';

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
    $scope.stage = null;
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
            } else {
                //Проверяем залогин ли пользователь
                try {
                    const currentUserJson = fs.readFileSync(appConfigPath + "currentUser.json");
                    // Проверяем информацию о системе
                } catch (e) {
                    if (e.code === 'ENOENT') {
                        $scope.stage = "user";
                    } else {
                        console.error(e);
                    }
                }
            }
        }).catch((e) => {
            $state.go('error', prepareError(e));
        });

    $scope.createUser = function () {
        $scope.stage = "user-create";
        $http.get(`${packageInfo.externalServer}/user/new`)
            .then(function(response) {
                $scope.newUser = response.data;

            }).catch((e) => {
            $state.go('error', prepareError(e));
        })
    }
});


mainApp.controller('ErrorCtrl', function ErrorController($scope, $state, $stateParams) {
    $scope.error = $stateParams.error;
    $scope.reconnect = function () {
        $state.go('initialize');
    }
});