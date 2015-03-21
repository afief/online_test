var lg = console.log.bind(console);

(function() {
	var toApp = angular.module("tryout", ["ngRoute", "UserModule", "PageControllers"], ["$httpProvider", function($httpProvider) {
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
	}]);

	toApp.config(['$routeProvider',
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

	toApp.run(['$rootScope', '$location', 'user', function($root, $location, user) {
		$root.$on('$routeChangeStart', function(e, curr, prev) {

		});
		$root.$on('$routeChangeSuccess', function(e, curr, prev) { 
			var authenticate = curr.$$route.authenticate || false;
			if (authenticate && !user.isLogin()) {
				e.preventDefault();
				$location.path("/login");
			} else if ((curr.$$route.originalPath == "/login") && user.isLogin()) {
				if (prev && prev.$$route && (prev.$$route.originalPath != curr.$$route.originalPath))
					$location.path(prev.$$route.originalPath);
				else
					$location.path("/");
			}
		});
	}]);

})();