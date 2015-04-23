define(["../../CanvasState"], function(canvasState) {

	var canvas;
	var history = [];
	var state;

	var activate = function () {
		state = canvas.toJSON(["elmType"]);
		console.log("undo state", state);
		canvas.clear().renderAll();
		canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));
		console.log("New state: ", canvas.toJSON(["elmType"]));
	};

	var deactivate = function () {
		/*console.log("undo reactivate");
		canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));*/
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