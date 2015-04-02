
define(["../../CanvasState"], function (CanvasState) {

		var helper_function = function() {
			console.log("helper function");

		};

		var activate = function(CanvasState) {
			console.log("select activated");


		var canvas = CanvasState.canvas; 
		//canvas.selection = true; // enable group selection

		// for resizing and snap to grid functionality
		if(canvas.snapToGrid) {
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
		activate: activate(CanvasState),
		deactivate: deactivate()
	}
});