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

pageModule.factory('headerSrv', function() {
	return {
		showUpload: false,
		isLogin: false,
		whenLoginShow: false,
		reset: function() {
			this.showUpload = false;
			this.shownLoginShow = false;
		},
		iconUserClick: function() {
			this.whenLoginShow = !this.whenLoginShow;
		},
		iconProfileClick: function() {
			lg("User Profile");
		}
	}
});
pageModule.directive('header', function () {
	return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "pages/header.html",
        controller: ['$scope', 'user', '$route', 'headerSrv', function ($scope, user, $route, headerSrv) {
        	$scope.title = "Header";
        	$scope.srv = headerSrv;
        	$scope.clickUpload = function() {
        		$scope.$broadcast("uploadJawaban");
        	}
        }]
    }
});

pageModule.factory("popupSrv", ["$q", function($q) {
	var defer;
	return {
		isShow: false,
		header: "",
		text: "",
		buttons: [],
		show: function(header, text, buttons) {
			this.header = header;
			this.text = text;
			this.buttons = buttons || [{id: "ok", text: "OK"}, {id: "cancel", text: "Cancel"}];
			this.isShow = true;

			defer = $q.defer();

			return defer.promise;
		},
		hide: function(index) {
			this.isShow = false;

			defer.resolve(index);
		}
	}
}]);
pageModule.directive('popup', function () {
	return {
		restrict: 'A',
		replace: true,
		templateUrl: "pages/popup.html",
		controller: ['$scope', 'popupSrv', function ($scope, popupSrv) {
			$scope.pop = popupSrv;
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