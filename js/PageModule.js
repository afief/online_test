var pageModule = angular.module("PageModule", ["UserModule"]);

pageModule.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/', {
			templateUrl: 'pages/home.html',
			controller: 'HomeController',
			authenticate: true
		}).
		when('/login', {
			templateUrl: 'pages/login.html',
			controller: 'LoginController',
			authenticate: false,
			resolve: {
				authenticated: function(user) {
					return user.cek();
				}
			}
		}).
		when('/logout', {
			templateUrl: 'pages/logout.html',
			controller: 'LogoutController',
			authenticate: true
		}).
		otherwise({
			redirectTo: '/'
		});
	}
	]);


pageModule.directive('header', function () {
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
pageModule.controller("HomeController", ["$scope", function($scope) {
	lg("PAGE HOME");
}]);

/* Login Controller */
pageModule.controller("LoginController", ["$scope", "$location", "user", function($scope, $location, user) {

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
pageModule.controller("LogoutController", ["$scope", "user", "$location", function($scope, user, $location) {
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