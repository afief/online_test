var PageAdd = function() {
	var ini = this;
	var el = $("#page_add");
	var elDaftar = $("#daftar_add");
	var elTotal = $("#total_add");

	var daftar = [];

	this.key = "";

	el.children("form").submit(function(ev) {
		ev.preventDefault();

		tambahBarang(
			el.find("form [name=nama_barang]").val(),
			parseInt(el.find("form [name=harga_barang]").val() || 0),
			parseInt(el.find("form [name=jumlah_barang]").val() || 0)
			);
	});

	function tambahBarang(barang, harga, jumlah) {
		tambahKeList(barang, harga, jumlah);

		//save to server
		user.tambahBelanjaan({
			identity: "iouofhsdof",
			belanjakey: ini.key,
			barang: barang,
			harga: harga,
			jumlah: jumlah
		}, function(status, data) {
			console.log("selesai tambah belanjaan", status, data);
		});
	}
	function tambahKeList(barang, harga, jumlah) {
		daftar.push({barang: barang, harga: harga, jumlah: jumlah});
		elDaftar.prepend(createEl(barang, harga, jumlah));

		hitungTotal();

		//clear input box
		el.find("form [name=nama_barang]").val("");
		el.find("form [name=harga_barang]").val("");
		el.find("form [name=jumlah_barang]").val(1);
		el.find("form [name=nama_barang]").focus();
	}

	function createEl(barang, harga, jumlah) {
		if (jumlah > 1) {
			var elBanyak = $("<div></div>");
			elBanyak.addClass("barang");
			elBanyak.addClass("banyak");

			elBanyak.append(create(barang, harga, ""));
			elBanyak.append(create("&nbsp;", harga * jumlah, jumlah + "x"));

			return elBanyak;
		} else {
			return create(barang, harga, jumlah + "x");
		}
		
		function create(barang, harga, jumlah) {
			var elBarang = $("<div></div>");
			var elHarga = $("<div></div>");
			var elJumlah = $("<div></div>");		

			elBarang.addClass("nama");
			elJumlah.addClass("jumlah");
			elHarga.addClass("harga");
			if (jumlah == "")
				elHarga.addClass("masing");

			elBarang.html(barang);
			elJumlah.html(jumlah);
			elHarga.html(numberToDotted(harga));

			var res = $("<div></div>");
			res.addClass("barang");
			res.append(elBarang);
			res.append(elJumlah);
			res.append(elHarga);

			return res;
		}
	}

	function hitungTotal() {
		var res = 0;
		for (var i = 0; i < daftar.length; i++) {
			res += daftar[i].harga * daftar[i].jumlah;
		}

		elTotal.html(numberToDotted(res));
	}
	
	function onShow() {
		console.log("Edit Daftar Belanja", ini.key);

		daftar = [];
		elDaftar.children(":not(:last-child)").remove();

		user.ambilBelanja(ini.key, function(status, data) {
			if (status) {
				var b = data.belanja;
				for (var i = 0; i < b.length; i++) {
					tambahKeList(b[i].barang, parseInt(b[i].harga), parseInt(b[i].jumlah));
				}
			}
		});
	}
	function onHide() {
		
	}

	this.show = function(key) {
		ini.key = key;
		el.show();
	}
	this.hide = function() {
		el.hide();
	}

	el.bind("show", function() {
		onShow();
	});
	el.bind("hide", function() {
		onHide();
	});
}