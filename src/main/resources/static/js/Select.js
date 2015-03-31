require.config({
	baseUrl: "../static/js",
	paths: {
		jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js",
	}
});

var dependencies = [
	"CanvasState"
];

// Select.js - moving, resizing, deleting canvas items. 
// It will also take care of changing snap to grid options in the CanvasState.

var Selector = {

	var activate(CanvasState) {
		var canvas = CanvasState.canvas; 
		canvas.selection = true; // enable group selection

		canvas.on('object:scaling', function(options)){
			// snap to grid functionality here
		};

	};

	var deactivate() {

	canvas.selection = false; // disable group selection

	};
};
