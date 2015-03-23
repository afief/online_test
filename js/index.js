var lg = console.log.bind(console);

(function() {
	var toApp = angular.module("tryout", ["ngRoute", "UserModule", "PageModule", "PelajaranModule"], ["$httpProvider", function($httpProvider) {
		$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
	}]);

	toApp.run(['$rootScope', '$location', 'user', '$route', 'headerSrv', function($root, $location, user, $route, headerSrv) {
		$root.$on('$routeChangeStart', function(e, curr, prev) {
			var authenticate = curr.$$route.authenticate || false;

			/* Kalau yang dibuka BUKAN page login, dan user tidak login, masuk ke page login */
			if (authenticate && !user.isLogin()) {

				e.preventDefault();
				user.cek().then(function(res) {
					if (res.data.status) {
						$route.reload();
					} else {
						$location.path("/login");
					}
				}, function() {
					$location.path("/login");
				});

			/* Kalau yang dibuka page login, dan user login, kembali ke page sebelumnya */
			} else if ((curr.$$route.originalPath == "/login") && user.isLogin()) {

				if (prev && prev.$$route && (prev.$$route.originalPath != curr.$$route.originalPath))
					$location.path(prev.$$route.originalPath);
				else
					$location.path("/");
			}

			headerSrv.reset();
		});
		$root.$on('$routeChangeSuccess', function(e, curr, prev) { 
			headerSrv.isLogin = user.isLogin();
		});
	}]);

})();