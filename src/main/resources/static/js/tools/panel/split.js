define(["../../CanvasState"], function (CanvasState) {

		var helper_function = function() {

		};

		var activate = function(CanvasState) {
			console.log("split activated");

		};

		var deactivate = function() {
			console.log("split deactivated");


		};
	return {
		activate: activate(CanvasState),
		deactivate: deactivate()
	}
});
