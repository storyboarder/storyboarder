define(["../../CanvasState"], function(canvasState) {

	//bug: clicking on draw right after

	var canvas;
	var start = 0;
	var times = 0;

	var activate = function() {
		
		canvas = canvasState.getCanvas();
		var active = canvasState.getActiveObj();

		if(active && active.elmType === "panel") {
			canvas.on("mouse:up", function(options) {
				var path = canvas._objects[canvas._objects.length - 1];
				path.clipTo = function(ctx) {
					ctx.save();

					ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation to default for canvas
					ctx.rect(
						active.left, active.top, // Just x, y position starting from top left corner of canvas
						active.width, active.height // Width and height of clipping rect
					);

					ctx.restore();
				};

				canvas.renderAll();
			});
		}

		console.log("draw activated");

		canvas.isDrawingMode = true;

		canvas.on("mouse:up", function() {
			if (canvas.isDrawingMode) canvas.trigger("change");
		});

		return this;
	};

	var deactivate = function() {
		console.log("draw deactivate");
		canvas.isDrawingMode = false;
		canvas.off("mouse:up");

	};

	var change = function(property, value) {
		canvasState.getCanvas().freeDrawingBrush[property] = value;
	}

	return {
		name: "Draw",
		activate: activate,
		deactivate: deactivate,
		set: function (property, value) {
			change(property, value);
		}
	};

});