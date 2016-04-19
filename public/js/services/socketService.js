angular.module('App').service('SocketService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

  var service = this;

  var socketChat; 

  this.getSocket = function () {
    socketChat = io.connect(window.location.protocol+"//"+window.location.host+"/chat");
    return socketChat;
  }

  this.disconnectSocket = function (argument) {
    if(socketChat!=null){
      socketChat.close();
    }
  }

}]);