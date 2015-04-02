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

<<<<<<< HEAD
	require(dependencies, function(editor, menu) {
=======
	// fabric is not being recognized for some reason
	var canvas = new fabric.Canvas('canvas');
	canvas.setHeight(600);
	canvas.setWidth(400);
	canvas.renderAll();
>>>>>>> 523c2ba887365e5b7a0840e4b1701c3ca59ba28c

		editor.init();
	});
});
