'use strict';

/* Controllers */

var controllers = angular.module('myApp.controllers', []);
  
controllers.controller('ChatController', ["$scope", "$location", "$anchorScroll", 'socket', function($scope, $location, $anchorScroll, socket) {
    $scope.chatInProgress = false;
    $scope.searching = true;
    $scope.transcript = [];
    $scope.inputText = "";
    socket.emit('new', null);

    socket.on('leave', function() {
        $scope.chatInProgress = false;
        socket.emit('leave', null);
    });

    socket.on('msg', function(data) {
        addMessage("Stranger", data);
    });

    socket.on('new', function() {
        $scope.chatInProgress = true;
        $scope.searching = false;
    });

    $scope.stopChat = function() {
        $scope.chatInProgress = false;
        $scope.transcript = [];
        socket.emit('leave', null);
    };

    $scope.sendMsg = function() {
        addMessage("You", $scope.inputText);
        socket.emit('msg', $scope.inputText);
        $scope.inputText = "";
    };

    $scope.keydown = function($event) {
        if ($event.keyCode == 13) {
            $event.preventDefault();
            $scope.sendMsg();
        }
    };

    $scope.findNewPartner = function() {
        $scope.transcript = [];
        $scope.searching = true;
        socket.emit('new', null);
    };

    function addMessage(participant, txt) {
        $scope.transcript.push({
            "participant": participant,
            "txt": txt
        });
        $location.hash("bottom");
        $anchorScroll();
    }
}]);