define(["../../CanvasState"], function (canvasState) {
	var canvas;
	var fillColor;

	// Activate fill tool
	var activate = function() {
		// Get fabricjs canvas
		canvas = canvasState.getCanvas();

		// When the mouse is down fill
		// the selected panel
		var selected;
		canvas.on("mouse:down", function(coor) {
			selected = coor.target;

			if (selected && selected.elmType === "panel") {
				console.log(fillColor);
				selected.fill = fillColor;
				canvas.renderAll();
				canvas.trigger("change");
			}
		});

		return this;
	};

	// Deactivate fill tool
	var deactivate = function() {
    	canvas.off("mouse:down");
	};

	// Fill tool public api
	return {
		name: "Fill",
		activate: activate,
		deactivate: deactivate,
		set: function (property, value) {
			if (property == "fillColor") fillColor = value;
		}
	};
});