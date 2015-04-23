define(["../../CanvasState"], function(canvasState) {

	var canvas;

	var activate = function () {
		canvasState.restoreState();
	};

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