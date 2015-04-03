define(["../../CanvasState"], function (CanvasState) {

	var canvasState;
	var canvas;

	/* activate returns this (the tool) */
	var activate = function() {
		console.log("select activated");
		canvas.selection = true; // enable group selection

		canvasState.filterMapElements(
			function(e) { // filter
				return e.type == "panel";
			},
			function(found) { // map
				found.element.set({
					selectable: true,
					lockScalingX: false,
					lockScalingY: false
				});
			}
		);

		// for resizing and snap to grid functionality
		if(canvasState.getSnapToGrid()) {
			canvas.on('object:scaling', function(options) {
				console.log(options);
				if(options.e.clientX < distanceToClosestX) {
					// snap or display snap line
				}

				if(options.e.clientY < distanceToClosestY) {
					// snap or display snap ine
				}
			});
		};

		canvas.on('object:selected', function(options) {
			if(options.type !== 'text') {
				var obj = options.target;
				// obj.onKeyPress(e);
			}
		});
		return this;
	};

	var deactivate = function() {
		console.log("select deactivated");
		canvas.selection = false; // disable group selection
	};

	return {
		name: "Select",
		init: function () {
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	}
});
