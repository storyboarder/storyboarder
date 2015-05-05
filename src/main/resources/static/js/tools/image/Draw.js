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
				path.activeObj = active;
				path.clipTo = function(ctx) {ctx.save();ctx.setTransform(1, 0, 0, 1, 0, 0);ctx.rect(this.activeObj.left + 1, this.activeObj.top + 1, this.activeObj.width - 1, this.activeObj.height - 1);ctx.restore();};
				canvas.renderAll();
			});
		}

//		console.log("draw activated");

		canvas.isDrawingMode = true;

		canvas.on("mouse:up", function() {
			if (canvas.isDrawingMode) canvas.trigger("change");
		});

		return this;
	};

	var deactivate = function() {
//		console.log("draw deactivate");
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