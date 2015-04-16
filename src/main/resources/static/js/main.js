require.config({
	baseUrl: "js",
	paths: {
		jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min",
		fabricjs: "http://fabricjs.com/lib/fabric",
		tools: "tools",
		view: "view",
	}
});

var dependencies = [
	"Editor",
	"Menu"
];

$(document).ready(function() {

	// should prompt user for project initialization
	// but for the moment values are hard-coded
	// also, should be initialized from editor, but for the moment Main will do it
	
	var canvas = document.getElementById('canvas');
	canvas.width = 400;
	canvas.height = 600;
	require(['CanvasState'], function(CanvasState) {
		canvasState = CanvasState.getCanvasState();
		canvasState.setPageMargin(20);
		canvasState.setGridSpacing(20);
		canvasState.setPanelMargin(5);
		canvasState.init(canvas);

		console.log(canvasState);

		require(dependencies, function(editor, menu) {
			editor.init("canvas");
			console.log(menu);
			menu.init();
			editor.test(); /* */
		});
	});
});
