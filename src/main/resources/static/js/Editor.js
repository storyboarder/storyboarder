define(["./CanvasState", "./tools/Toolset"], function(canvasState, toolset) {


	var init = function(spec) {

		console.log(spec);
		var canvas = spec.canvas;
		var width = spec.width;
		var height = spec.height;
		var pageMargin = spec.pageMargin;
		var panelMargin = spec.panelMargin;
		canvas.width = width;
		canvas.height = height;
		console.log(width, height);

		console.log(canvas);
		console.log(canvas.attr("id"));

		canvasState.setPageMargin(pageMargin);
		canvasState.setGridSpacing(20);
		canvasState.setPanelMargin(panelMargin);
		console.log("init canvas state");
		canvasState.init(canvas.attr("id"), width, height);

		console.log("init editor");

		/* init all tools in the toolset so they get the canvas state */
		toolset.init();

		/* activate a tool to start with (esp. helpful for testing) */
		this.activate("Select");
	};

	var activate = function(toolname) {
		toolset.activate(toolname);
	};

	var action = function(name) {
    toolset.action(name);
	};

	var test = function() {
		toolset.test();
		// console.log("editor tested");
		// console.log("toolset is now " + toolset);
		// console.log("test activating Split...");
		//console.log("activating split from editor 2");

		//this.activateTool("Split");
		// console.log(canvasState.getPageMargin());
	};

	return {
		init: init,
		activate: activate,
		action, action,
		test: test
	};

});