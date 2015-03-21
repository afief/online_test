var pageControllers = angular.module("PageControllers", ["UserModule"]);

/* Home Controller */
pageControllers.controller("ctrlHome", ["$scope", function($scope) {
	lg("PAGE HOME");
}]);

/* Login Controller */
pageControllers.controller("ctrlLogin", ["$scope", "$location", "user", function($scope, $location, user) {

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
pageControllers.controller("ctrlLogout", ["$scope", "user", "$location", function($scope, user, $location) {
	$scope.logout = function() {
		user.logout(function(res) {
			if (res)
				$location.path("/");
			else
				alert("Logout Gagal");
		});
	}
}]);