require.config({
	baseUrl: "../static/js",
	paths: {
		jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js",
		fabricjs: "http://fabricjs.com/lib/fabric",
		tools: "tools",
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
	canvas.height = 600;
	canvas.width = 400;

	require(dependencies, function(canvasState, editor, menu) {

		console.log("canvas");
		canvasState.setPageMargin(15);
		canvasState.setGridSpacing(20);
		canvasState.setPanelMargin(10);
		canvasState.setCanvas(canvas);

		console.log(canvasState);


		console.log(editor);
		editor.test();
	});
});
