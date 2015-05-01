define(["../../CanvasState"], function (canvasState) {

	var activate = function() {
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
    	canvas.__eventListeners["mouse:down"] = [];
	};

	
	return {
		name: "Fill",
		init: function () {
			console.log("init fill");
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};
	
});