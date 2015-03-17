function ObjectEvents() {
	var list = {};
	this.on = function(name, func) {
		if (list[name] == undefined) {
			list[name] = new Array();
		}
		list[name].push(func);
	}
	this.send = function(name, data) {
		data = ((typeof data !== 'undefined') ? data : {});
		if (list[name] != undefined) {
			for (var i = 0; i < list[name].length; i++) {
				list[name][i](data);
			}
		}
	}
}