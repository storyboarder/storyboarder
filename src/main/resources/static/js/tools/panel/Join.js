define(["../../CanvasState"], function (CanvasState) {
	var previewDivideLine;
	var canvasState;
	var canvas;

	/* activate returns this (the tool) */
	var activate = function() {
	};


	var deactivate = function() {

	};

	/* the following code should probably be the same for all tools */
	return {
		name: "Join",
		init: function () {
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	}
});
