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
				authenticated: ["user", function(user) {
					return user.cek();
				}]
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
        	console.log("header");
            // $scope.$watch(function() { return hdi.nilai; }, function(newVal, oldVal) {
            // 	$scope.title = newVal;
            // });
}]
}
});

/* Home Controller */
pageModule.controller("HomeController", ["$scope", "$location", function($scope, $location) {
	lg("PAGE HOME");

	$scope.keSoal = function() {
		$location.path("/pelajaran");
	}
}]);

/* Login Controller */
pageModule.controller("LoginController", ["$scope", "$location", "user", function($scope, $location, user) {

	lg("PAGE LOGIN");

	$scope.data = {
		username: "",
		password: ""
	}
	$scope.submit = function() {
		user.login($scope.data).then(function(res) {
			if (res.data.status)
				$location.path("/");
			else
				alert("Username / Password Salah");
		}, function() {
			alert("Login Failed");
		});
	};

}]);

/* Home Controller */
pageModule.controller("LogoutController", ["$scope", "user", "$location", function($scope, user, $location) {
	lg("PAGE LOGOUT");

	$scope.logout = function() {
		user.logout().then(function() {
			$location.path("/");
		}, function() {
			alert("Logout Failed");
		});
	}
}]);