App.controller("DepositController", function($scope) {

	  $scope.helloTo = {};
	  $scope.helloTo.title = "AngularJS";

	  var img = document.querySelector('img');

	  $scope.startRoulette = function() {
	  	img.removeAttribute('style');
    
	    var deg = 500 + Math.round(Math.random() * 500);
	    
	    var css = '-webkit-transform: rotate(' + deg + 'deg);';
    
	    img.setAttribute(
	        'style', css
	    );
	  };

});