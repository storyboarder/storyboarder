define(["./CanvasState", "./tools/Toolset"], function(CanvasState, toolset) {

	var currentTool;

	return {
		init: function (canvasId) {
			/* ideally the CanvasState will be initialized from here instead of from Main. */

			console.log("init editor");

			/* init all tools in the toolset so they get the canvas state */
			toolset.init();

			/* activate a tool to start with (esp. helpful for testing) */
			this.activate("Split");
		},

		activate: function (toolname) {
			if (currentTool) {
				currentTool.deactivate();
			}
		  	currentTool = toolset.activateTool(toolname);
		  	console.log("set currentTool to", currentTool)
		},

		test: function() {
		  // console.log("editor tested");
		  // console.log("toolset is now " + toolset);
		  // console.log("test activating Split...");
			//console.log("activating split from editor 2");

		  // toolset.activateTool("Split");
		  // console.log(canvasState.getPageMargin());
	  	}

	}

});

