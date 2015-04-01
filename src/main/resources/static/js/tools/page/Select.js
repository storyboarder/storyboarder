
define(["../../CanvasState"], function (CanvasState) {

		var helper_function = function() {

		};

		var activate = function(CanvasState) {
			console.log("select activated");
		};

		var deactivate = function() {
			console.log("select deactivated");


		};
	return {
		activate: activate(CanvasState),
		deactivate: deactivate()
	}
});
