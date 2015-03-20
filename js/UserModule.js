var userModule = angular.module("UserModule", []);

userModule.factory("user", ["$http","$q", function($http, $q) {

	var key = window.localStorage.getItem("key") || "";
	var isLogin = false;

	function changeKey(newKey) {
		key = newKey;
		window.localStorage.setItem("key", key);
		console.log("change key", key);
	}

	return {
		getKey: function() {
			return key;
		},
		isLogin: function() {
			return isLogin;
		},
		login: function(credential) {

			var promise = $http.post("api/login", $.param(credential)).
			success(function(data) {
				if (data.status) {
					changeKey(data.key);
					isLogin = true;					
				}
				return data;
			}).
			catch(function(err) {
				return err;
			});

			return promise;

		},
		cek: function() {
			if (key == "")
				return $q.when({data: {status: false}});

			var promise =  $http.post("api/user", $.param({key: key})).
			success(function(data, status) {
				if (data.status) {
					isLogin = true;
				}
				return data;
			}).
			catch(function(err) {
				return err;
			});

			return promise;
		},
		changeKey: changeKey,
		logout: function() {
			$http.post("api/logout", $.param({key: key})).
			success(function(data) {
				if (data.status) {
					isLogin = false;
				}
				changeKey("");
				return data;
			}).
			catch(function(err) {
				changeKey("");
				return err;
			});
		}
	}

}]);