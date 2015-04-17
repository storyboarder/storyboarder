define(["../../CanvasState"], function(canvasState) {

	var canvas;

	var deactivate = function() {

	};

	return {
		name: "Undo",
		init: function() {
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};
});