var userModule = angular.module("UserModule", []);

userModule.factory("user", ["$http", function($http) {
	console.log("user init");
	var key = window.localStorage.getItem("key") || "";
	var isLoggedIn = false;
	function changeKey(newKey) {
		key = newKey;
		window.localStorage.setItem("key", key);
		console.log("change key", key);
	}

	return {
		key: key,
		isLoggedIn: isLoggedIn,
		login: function(credential, callback) {

			$http.post("api/login", $.param(credential)).
			success(function(data) {
				if (data.status) {
					changeKey(data.key);
					isLoggedIn = true;
					callback(true);
				} else {
					callback(false);
				}
			}).
			error(function(data) {
				callback(false);
			});

		},
		cek: function(callback) {

			if (key == "") {
				callback(false);
				return;
			}
			$http.post("api/user", $.param({key: key})).
			success(function(data) {
				console.log(data);
				if (data.status) {
					callback(true);
					isLoggedIn = true;
				} else {
					callback(false);
				}
			}).
			error(function(data) {
				callback(false);
			});

		},
		changeKey: changeKey,
		logout: function(callback) {
			$http.post("api/logout", $.param({key: key})).
			success(function(data) {
				if (data.status) {
					callback(true);
					isLoggedIn = false;
				}
			}).
			error(function(data) {
				callback(false);
			});
		}
	}

}]);