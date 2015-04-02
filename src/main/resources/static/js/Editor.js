define(["CanvasState", "tools/Toolset"], function(CanvasState, toolset) {
	/*var toolset = {
		"split": Split,
		"text": Text
	};*/
	console.log(toolset);

	return {
		init: function (canvasId) {
			var canvasState = CanvasState.getCanvasState();
			// console.log(canvasState);
				  /*
			CanvasState.init(canvasId);
			CanvasState.setPageMargin(15);
			CanvasState.setGridSpacing(20);
			CanvasState.setPanelMargin(10);
			*/
/*
			for (var toolname in toolset) {
				if (toolset.hasOwnProperty(toolname)) {
					toolset[toolname].init(CanvasState);
				}
			}
			*/

			this.activate("Split");
		},

		activate: function (toolname) {
			//toolset[toolname].activate();
		  toolset.activateTool(toolname);
		},

		test: function() {
		  // console.log("editor tested");
		  // console.log("toolset is now " + toolset);
		  // console.log("test activating Split...");
		  toolset.activateTool("Split");
		  // console.log(canvasState.getPageMargin());
	  	}

	}

});

