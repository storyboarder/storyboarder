define(["../../CanvasState"], function (canvasState) {
	var canvas;

	var activate = function() {
		canvas = canvasState.getCanvas();

		var selected;
		canvas.on("mouse:down", function(coor) {
			selected = coor.target;

			if(selected && selected.elmType === "panel") {
				console.log(selected);
				console.log("YAY!");
				selected["fill"] = $("#fill-color").val();
				canvas.renderAll();
			}
		});

		return this;
	};

	var deactivate = function() {
    	canvas.off("mouse:down");
	};

	
	return {
		name: "Fill",
		activate: activate,
		deactivate: deactivate
	};
	
});