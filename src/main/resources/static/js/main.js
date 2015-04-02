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

	require(dependencies, function(editor, menu) {

		editor.init();
	});
});
