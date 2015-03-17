var PageDaftar = function() {
	var ini = this;
	var el = $("#page_daftar");
	var elDaftar = $("#daftar_belanja");
	var totalHarga = 0;

	var daftar = [];

	this.event = new ObjectEvents();

	$("#btTambahDaftar").click(function() {
		ini.event.send("add");
	});

	function createEl(nama, content) {
		var el = $("<div></div>");
		el.addClass(nama);
		if (typeof content == "object") {
			for (var k in content) {
				el.append(createEl(k, content[k]));
			}
		} else {
			el.html(content);
		}
		return el;
	}
	function daftarBelanja(data) {
		var elBelanja;
		var buttons;
		var btEdit;
		for (var i = 0; i < data.length; i++) {
			totalHarga += data[i].total;

			elBelanja = createEl(
				"belanja", {
					content: {
						tempat: data[i].tempat,
						keterangan: data[i].keterangan,
						total: "Rp " + numberToDotted(data[i].total) + ",-"
					},
					tanggal: data[i].tanggal
				});
			buttons = createEl("buttons", "");

			btEdit = createEl("button edit", "e");
			btEdit.attr("key", data[i].key);
			btEdit.unbind("click").bind("click", onBelanjaClick);
			buttons.append(btEdit);

			elBelanja.append(buttons);
			elDaftar.prepend(elBelanja);
		}	

		el.find(".total_belanja").html("Rp " + numberToDotted(totalHarga) + ",-");
	}
	function onBelanjaClick(elBelanja) {
		if ($(elBelanja.currentTarget).attr("key"))
			ini.event.send("edit", $(elBelanja.currentTarget).attr("key"));
	}

	
	function onShow() {
		elDaftar.children().remove();
		totalHarga = 0;

		user.ambilDaftarBelanja(onDaftarBelanja);
		function onDaftarBelanja(status, data) {
			if (status)
				daftarBelanja(data);
		}
	}
	function onHide() {
		
	}

	this.isVisible = function() {
		return el.is(":visible");
	}
	this.show = function() {
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