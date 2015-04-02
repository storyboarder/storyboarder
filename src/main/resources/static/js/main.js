require.config({
	baseUrl: "../static/js",
	paths: {
		jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js",
		fabricjs: "http://fabricjs.com/lib/fabric",
		tools: "tools",
	}
});

var dependencies = [
	"Editor",
	"view/Menu"
];

$(document).ready(function() {

	// should prompt user for project initialization
	// but for the moment values are hard-coded

	/* fabric is not being recognized for some reason
	var canvas = new fabric.Canvas('canvas');
	canvas.setHeight(600);
	canvas.setWidth(400);
	canvas.renderAll();
	*/
	
	var canvas = document.getElementById('canvas');
	canvas.width = 400;
	canvas.height = 600;
	require(['CanvasState'], function(CanvasState) {
		console.log(CanvasState);
		canvasState = CanvasState.getCanvasState();
		canvasState.setPageMargin(0);
		canvasState.setGridSpacing(20);
		canvasState.setPanelMargin(5);
		canvasState.init(canvas);
		console.log("done calling init canvas state");

		console.log(canvasState);
		console.log(canvasState.getPageMargin());
		
		console.log("test");
		require(dependencies, function(editor, menu) {
			//console.log("main getting canvas state...");
			//console.log("done getting canvas state");

			// console.log(canvasState);
			// canvasState.setPageMargin(17);
			// canvasState.setGridSpacing(20);
			// canvasState.setPanelMargin(10);
			// canvasState.init(canvas);

			console.log(canvasState);


			console.log(editor);
			editor.init("canvas");
			editor.test();
		});
	});
});
