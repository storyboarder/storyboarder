define(function(require) {

	var currentTool;

	var toolset = {
		"Split" : require("./panel/Split"),
		"Select" : require("./page/Select"),
		"Text" : require("./text/Text")
	};

	var activate = function(toolname) {
		if (toolname in toolset) {
			if (currentTool) {
				currentTool.deactivate();
				console.log("deactivating from toolset:", currentTool.name)
			}
			console.log("activating from toolset:", toolname);
			currentTool = toolset[toolname].activate();
		} else {
			throw "Tool not found: " + toolname;
		}
	}

	return {
		init: function () {
			console.log("initing tools");
			for (var i in toolset) {
				toolset[i].init();
			}
		},
		toolset: toolset,
		activate: activate,
		test: function() {
			activate("Split");
			currentTool.test();
			activate("Select");
		}
	};
});



