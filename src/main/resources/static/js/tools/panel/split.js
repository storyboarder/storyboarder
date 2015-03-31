define(["../../CanvasState"], function (CanvasState) {

		var helper_function = function() {
			console.log("helper function");

		};

		var activate = function(CanvasState) {
			console.log("activate");

		};

		var deactivate = function() {
			console.log("deactivate");


		};
	return {
		activate: activate(CanvasState),
		deactivate: deactivate()
	}
});
