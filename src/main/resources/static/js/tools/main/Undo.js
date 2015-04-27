define(["../../CanvasState"], function(canvasState) {

	var canvas;
	var history = [];
	var state;

	var activate = function () {
		canvasState.revertState();
		/*var newState = canvasState.getState();
		var delta = jsondiffpatch.diff(state, newState);

		history.push(delta);

		// console.log("undo state", state);
		canvas.clear().renderAll();
		canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));
		// console.log("New state: ", canvas.toJSON(["elmType"]));

		state = newState;*/
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