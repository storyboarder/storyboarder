define(["./CanvasState", "./tools/Toolset"], function(CanvasState, toolset) {

	return {
		init: function (canvasId) {
			/* ideally the CanvasState will be initialized from here instead of from Main. */
			console.log("init editor");

			 toolset.init();
			// console.log(canvasState);

			this.activate("Split");
		},

		activate: function (toolname) {
			console.log("editor activating ", toolname);
		  	toolset.activateTool(toolname);
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

