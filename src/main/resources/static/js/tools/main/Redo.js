define(["../../CanvasState"], function(canvasState) {

	var canvas;

	var activate = function () {
		canvasState.storeState();
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