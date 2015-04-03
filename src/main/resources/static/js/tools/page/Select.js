define(["../../CanvasState"], function (CanvasState) {

		var canvasState;
		var canvas;

		var activate = function() {
			console.log("select activated");
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();

			//canvas.selection = true; // enable group selection //

			// for resizing and snap to grid functionality
			if(canvasState.getSnapToGrid()) {
				canvas.on('object:scaling', function(options) {
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

		};

		var deactivate = function() {
			console.log("select deactivated");
			canvas.selection = false; // disable group selection
		};

	return {
		init: function () {
			console.log("init");
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
			console.log(canvasState);
			console.log(canvas);
		},

		activate: activate(CanvasState),
		deactivate: deactivate()
	}
});
