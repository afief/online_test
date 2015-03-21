var pageControllers = angular.module("PageControllers", ["UserModule"]);


pageControllers.directive('header', function () {
    return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "pages/header.html",
        controller: ['$scope', 'user', function ($scope, user) {
        	$scope.title = "Header";
            // $scope.$watch(function() { return hdi.nilai; }, function(newVal, oldVal) {
            // 	$scope.title = newVal;
            // });
        }]
    }
});

/* Home Controller */
pageControllers.controller("HomeController", ["$scope", function($scope) {
	lg("PAGE HOME");
}]);

/* Login Controller */
pageControllers.controller("LoginController", ["$scope", "$location", "user", function($scope, $location, user) {

	lg("PAGE LOGIN");

	$scope.data = {
		username: "",
		password: ""
	}
	$scope.submit = function() {
		user.login($scope.data, function(res) {
			if (res)
				$location.path("/");
			else
				alert("Login Gagal");
		});
	};

}]);

/* Home Controller */
pageControllers.controller("LogoutController", ["$scope", "user", "$location", function($scope, user, $location) {
	lg("PAGE LOGOUT");
	
	$scope.logout = function() {
		user.logout(function(res) {
			if (res)
				$location.path("/");
			else
				alert("Logout Gagal");
		});
	}
}]);