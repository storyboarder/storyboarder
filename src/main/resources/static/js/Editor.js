define(["./CanvasState", "./tools/Toolset"], function(CanvasState, toolset) {


	var init = function(canvasId) {
		/* ideally the CanvasState will be initialized from here instead of from Main. */

		console.log("init editor");

		/* init all tools in the toolset so they get the canvas state */
		toolset.init();

		/* activate a tool to start with (esp. helpful for testing) */
		//this.activate("Split");
	};

	var activate = function(toolname) {
	  	toolset.activate(toolname);
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
		test: test
	}

});

