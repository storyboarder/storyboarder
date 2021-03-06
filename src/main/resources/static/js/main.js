require.config({
	baseUrl: "js",
	// Paths to libaries
	paths: {
		jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min",
		jqueryui: "https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min",
		fabricjs: "http://fabricjs.com/lib/fabric",
		jsondiffpatch: "https://cdn.rawgit.com/benjamine/jsondiffpatch/master/public/build/jsondiffpatch-full.min",
		jsPDF: "https://cdn.rawgit.com/MrRio/jsPDF/master/dist/jspdf.min",
		tools: "tools",
		view: "view",
		semanticui: "semantic"
	},
	shim: {
		"semanticui": {
			deps: ["jquery"],
			exports: "semanticui"
		},
		"jqueryui": {
			deps: ["jquery"],
			exports: "jqueryui"
		}
	},

	callback: function() {
		// should prompt user for project initialization
		// but for the moment values are hard-coded
		// also, should be initialized from editor, but for the moment Main will do it

		var canvas = document.getElementById('canvas');
		canvas.width = 400;
		canvas.height = 600;

		require(["UserInterface", "Editor"], function(UI, editor) {
			editor.init();
			UI.init();

			// editor.test();
		});

	}
});

function quit() {
	$.post("/quit", {}, function(responseJSON) {});
}