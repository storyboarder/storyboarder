define(["./CanvasState", "./tools/panel/Split"], function(CanvasState, Split) {
	var toolset = {
		"split": Split,
		"text": Text
	};

	return {
		init: function (canvasId) {
			CanvasState.init(canvasId);
			CanvasState.setPageMargin(15);
			CanvasState.setGridSpacing(20);
			CanvasState.setPanelMargin(10);

			for (var toolname in toolset) {
				if (toolset.hasOwnProperty(toolname)) {
					toolset[toolname].init(CanvasState);
				}
			}

			this.activate("split");
		},

		activate: function (toolname) {
			toolset[toolname].activate();
		},

		test: function() {
		  console.log("editor tested");
		  console.log("toolset is now " + toolset);
		  //toolset.activateTool("select");
	  	}

	}

});

