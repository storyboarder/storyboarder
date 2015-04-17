define(["../../CanvasState"], function (CanvasState) {

	var canvasState;
	var canvas;

	var deactivate = function() {

	};

	return {
		name: "Undo",
		init: function () {
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};
});