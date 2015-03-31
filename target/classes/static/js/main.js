require.config({
	baseUrl: "../static/js",
	paths: {
		jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js",
	}
});

var dependencies = [
	"CanvasState",
	"Editor",
	"view/Menu"
];

$(document).ready(function() {

	// should prompt user for project initialization
	// but for the moment values are hard-coded

	var canvas = document.getElementById("canvas");
	canvas.height = 700;
	canvas.width = 400;

	require(dependencies, function(util) {
		var canvasState = new CanvasState(canvas);
		canvasState.setPageMargin(15);
		canvasState.setGridSpacing(20);
		canvasState.setPanelMargin(10);
		console.log(canvasState);
	});
});
