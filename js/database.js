var UserDB = function() {
	var ini = this;
	var baseUrl = "api/";

	this.username = "";
	this.email = "";
	this.key = "";

	ambilLocalKey();
	function ambilLocalKey() {
		var userkey = localStorage.getItem("userkey");
		if (userkey != null)
			ini.key = userkey;
	}
	function simpanLocalKey() {
		localStorage.setItem("userkey", ini.key);
	}


	this.cekLogin = function(callback) {
		
		if (ini.key != "") {
			ini.query("user",
				{key: ini.key},
				function(data) {
					console.log(ini.key, data);
					if (data.status) {
						ini.username = data.data.username;
						ini.email = data.data.email;

						simpanLocalKey();
						callback(true);
					} else {
						callback(false);
					}
				},
				function(err) {
					console.log("error", err);
					callback(false);
				}
				);
		} else {
			callback(false);
		}
		
	}


	this.login = function(username, password, callback) {

		ini.query("login",
		{
			username: username,
			password: password
		},
		function(data) {
			if (data.status) {
				ini.key = data.key;
				ini.username = username;

				simpanLocalKey();
				callback(true);
			} else {
				callback(false);
			}
		},
		function(err) {
			callback(false);
		}
		);
	}

	this.logout = function(key, callback) {

		ini.query("logout",
		{
			key: key
		},
		function(data) {
			console.log("Logouting", data);
			if (data.status) {
				callback(true);
			} else {
				callback(false);
			}
		},
		function(err) {
			callback(false);
		}
		);
	}

	this.query= function(permalink, data, success, failed, method) {
		method = method || "POST";
		success = success || function() {};
		failed = failed || function() {};

		$.ajax({
			url: baseUrl + permalink,
			method: method,
			dataType: "json",
			data: data,
			success: success,
			error: failed
		});
	}


	//belanja stuff

	/* Ambil daftar kegiatan belanja yang dilakukan user */
	this.ambilDaftarBelanja = function(callback) {
		if (ini.key != "") {
			ini.query("daftar",
				{key: ini.key},
				function(data) {
					console.log("daftar belanja", data);
					if (data.status) {
						callback(true, data.data);
					} else {
						callback(false);
					}
				},
				function(err) {
					console.log("error", err);
					callback(false);
				}
				);
		} else {
			callback(false);
		}
	}
	this.tambahDaftarBelanja = function(data, callback) {
		if (ini.key != "") {
			data.key = ini.key;
			ini.query("daftar/tambah",
				data,
				function(data) {
					console.log("tambah belanja", data);
					if (data.status) {
						callback(true, data.data);
					} else {
						callback(false);
					}
				},
				function(err) {
					console.log("error", err);
					callback(false);
				}
				);
		} else {
			callback(false);
		}
	}


	/* ambil satu data belanja beserta barang yang dibelanjakan oleh user */
	this.ambilBelanja = function(key, callback) {
		if (ini.key != "") {
			ini.query("belanja",
			{
				key: ini.key,
				belanjakey: key
			},
			function(data) {
				console.log("belanjaan", data);
				if (data.status) {
					callback(true, data.data);
				} else {
					callback(false);
				}
			},
			function(err) {
				console.log("error", err);
				callback(false);
			}
			);
		} else {
			callback(false);
		}
	}
	this.tambahBelanjaan = function(data, callback) {
		if (ini.key != "") {
			data.key = ini.key;

			ini.query("belanja/tambah",
				data,
				function(data) {
					console.log("tambah belanjaan", data);
					if (data.status) {
						callback(true, data.data);
					} else {
						callback(false);
					}
				},
				function(err) {
					console.log("error", err);
					callback(false);
				}
				);
		} else {
			callback(false);
		}
	}


}
