define(["../../CanvasState"], function(canvasState) {

	var canvas;

	var deactivate = function() {

	};

	return {
		name: "Redo",
		init: function() {
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};
});