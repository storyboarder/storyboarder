require.config({
	baseUrl: "../static/js",
	paths: {
		jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js",
	}
});

var dependencies = [
	"CanvasState"
];

// Select.js 
// moving, resizing : taken care of by fabric js
// deleting canvas items :  either option to select and press delete or drag to "trashcan"
// It will also take care of changing snap to grid options in the CanvasState.

var Selector = {

	var activate(CanvasState) {
		var canvas = CanvasState.canvas; 
		canvas.selection = true; // enable group selection

		// for resizing and snap to grid functionality
		if(canvas.snapToGrid;) {
			canvas.on('object:scaling', function(options)) {
				if(options.e.clientX < distanceToClosestX) {
					// snap or display snap line
				}

				if(options.e.clientY < distanceToClosestY) {
					// snap or display snap ine
				}
			};
		};
		

		canvas.on('object:selected', function(options)) {
			if(options.type !== 'text') {
				var obj = options.target;
				// obj.onKeyPress(e);
			}
		}

	};

	var deactivate() {

	canvas.selection = false; // disable group selection

	};
};
