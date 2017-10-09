const packageInfo = require("./package");

const path = require('path');
const url = require('url');
const fs = require('fs');
const gpuInfo = require('gpu-info');

const remote = require('electron').remote;
const app = remote.app;
const clipboard = remote.clipboard;



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
    } if (e.status === 400) {
        return {
            error: {
                icon: 'warning',
                header: "Произошла неожиданная ошибка",
                message: e.data
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

mainApp.service('appEnv', function() {
    let steamApiKey = null;
    let currentUser = null;

    this.steamApiKey = function(key) {
        if (!arguments.length) return steamApiKey;

        steamApiKey = key;
    };

    this.currentUser = function(curUser) {
        if (!arguments.length) return currentUser;

        currentUser = curUser;
    };
});

mainApp.controller('MainCtrl', function MainController($scope) {
    $scope.version = packageInfo.version;
    $scope.isMaximize = true;
    if (!fs.existsSync(appConfigPath)){
        fs.mkdirSync(appConfigPath);
    }

    $scope.maximizeWindow = function () {
        $scope.isMaximize = false;
        remote.getCurrentWindow().maximize();
    };

    $scope.minimizeWindow = function () {
        remote.getCurrentWindow().minimize();
    };

    $scope.restoreWindow = function () {
        $scope.isMaximize = true;
        remote.getCurrentWindow().unmaximize();
    };

    $scope.closeWindow = function () {
        app.quit();
    }
});

mainApp.controller('StartCtrl', function StartController($scope, $state, $http, appEnv) {
    $scope.stage = null;
    $scope.producers = [{title: "NVIDIA"}, {title: "INTEL"}, {title: "AMD"}];

    const checkSystemInfo = function () {
        try {
            const systemInfo = JSON.parse(fs.readFileSync(appConfigPath + "gpuInfo.json", 'utf8'));
            gpuInfo().then(function(gpus) {
                if (gpus.length !== systemInfo.length)
                    $scope.stage = "scan-gpu";
                else {
                    gpus.forEach((gpu, index)=>{
                        if (systemInfo[index].Caption !== gpu.caption)
                            $scope.stage = "scan-gpu";
                    })
                }
            });
            checkMinerInfo();
        } catch (e) {
            if (e.code === 'ENOENT') {
                $scope.stage = "scan-gpu";
                gpuInfo().then(function(gpus) {
                    $scope.$apply(()=>{
                        if (gpus && gpus.length !== 0) {
                             $scope.gpuInfo = gpus;
                             $scope.gpuInfo.forEach((gpu) => {
                                 let firm = gpu.AdapterCompatibility;
                                 if (firm && firm.toUpperCase().includes("NVIDIA")) {
                                     gpu.producer = "NVIDIA";
                                 } else if (firm && firm.toUpperCase().includes("INTEL")) {
                                     gpu.producer = "INTEL";
                                 } else {
                                     gpu.producer = "AMD";
                                 }
                            });

                        } else {
                            $scope.gpuInfoNotFound = true;
                        }

                    });
                }).catch((e)=>{console.error(e); $scope.gpuInfoNotFound = true;})
            } else {
                console.error(e);
            }
        }
    };

    const checkMinerInfo = function () {
        try {
            const systemInfo = JSON.parse(fs.readFileSync(appConfigPath + "minerInfo.json", 'utf8'));
            // переходим в библиотеку
        } catch (e) {
            if (e.code === 'ENOENT') {
                $scope.stage = "miner-check";
                
            } else {
                console.error(e);
            }
        }
    };
    
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
                appEnv.steamApiKey(data.steamApiKey);
                try {
                    const currentUserJson = JSON.parse(fs.readFileSync(appConfigPath + "currentUser.json", 'utf8'));
                    appEnv.currentUser(currentUserJson);
                    // Проверяем информацию о системе
                    checkSystemInfo();
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
                appEnv.currentUser($scope.newUser);
            }).catch((e) => {
            $state.go('error', prepareError(e));
        })
    };

    let timeout;
    $scope.$watch("newUser.steamAccount", function(newVal, oldVal) {
        if (newVal !== oldVal) {
            if (timeout)
                clearTimeout(timeout);
            timeout = setTimeout(function(){ $scope.getSteamPlayerInfo(); }, 400);
        }
    });

    $scope.showAdvice = function () {
      let steamWin = new remote.BrowserWindow({width: 800, height: 450});
        steamWin.on('closed', () => {
            steamWin = null
        });

        steamWin.loadURL(url.format({
            pathname: path.join(__dirname, 'howToKnowSteamId.html'),
            protocol: 'file:',
            slashes: true
        }))
    };
    
    $scope.getSteamPlayerInfo = function () {
        $scope.steamPlayerInfo = null;
        if (!$scope.newUser.steamAccount)
            return;
        $http({
            url: 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/',
            method: "GET",
            params: {key: appEnv.steamApiKey(), vanityurl: $scope.newUser.steamAccount}
        }).then((response) => {
            let steamId = response.data.response.steamid;
            steamId = steamId ? steamId : $scope.newUser.steamAccount;
            $http({
                url: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
                method: "GET",
                params: {key: appEnv.steamApiKey(), steamids: steamId}
            }).then((response2) => {
                const players = response2.data.response.players;
                if (players.length > 0) {
                    $scope.steamPlayerInfo = players[0];
                    $scope.newUser.steamId = players[0].steamid;
                }
            })
        });
    };

    function writeToFile(fileName, json) {
        fs.writeFile(appConfigPath + fileName, JSON.stringify(json), 'utf8', function(err) {
            if(err) {
                console.log(err);
            }
        });
    }

    $scope.saveUuidToClipboard = function () {
        clipboard.writeText(appEnv.currentUser().privateUUID);
    };

    $scope.activateUser = function () {
        if (!$scope.newUser.steamId)
            return;
        $http({
            url: `${packageInfo.externalServer}/user/activate`,
            method: "GET",
            params: {privateUUID: $scope.newUser.privateUUID, steamId: $scope.newUser.steamId}
        }).then((response) => {
            // Записать в файл и начать собирать информацию о системе
            $scope.newUser.enable = true;
            writeToFile("currentUser.json", $scope.newUser);
            $scope.stage = "show-private-UUID";
        }).catch((e) => {
            $state.go('error', prepareError(e));
        })
    };

    $scope.login = {};
    $scope.goToLogin = function () {
        $scope.stage = "user-login";
    };

    $scope.goToGpuScan = function () {
        checkSystemInfo();
    };

    $scope.goToMiner = function () {
        console.log(appEnv.currentUser());
        $http({
            url: `${packageInfo.externalServer}/user/setgpuinfo`,
            method: "POST",
            data: {privateUUID: appEnv.currentUser().privateUUID,
                    gpuInfo: $scope.gpuInfo}
        }).then(function(response) {
            writeToFile("gpuInfo.json", $scope.gpuInfo);
            checkMinerInfo();
        }).catch((e) => {
            $state.go('error', prepareError(e));
        });
    };

    $scope.login = function () {
        console.log($scope.login.UUID.length);
        if ($scope.login.UUID.length !== 36)
            return;
        $http({
            url: `${packageInfo.externalServer}/user/login`,
            method: "GET",
            params: {privateUUID: $scope.login.UUID}
        })
            .then(function(response) {
                appEnv.currentUser(response.data);
                writeToFile("currentUser.json", appEnv.currentUser());
                checkSystemInfo();
            }).catch((e) => {
            $state.go('error', prepareError(e));
        })
    };
});


mainApp.controller('ErrorCtrl', function ErrorController($scope, $state, $stateParams) {
    $scope.error = $stateParams.error;
    $scope.reconnect = function () {
        $state.go('initialize');
    }
});