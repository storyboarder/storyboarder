define(function(require) {

	var toolset = {
		"Split" : require("./panel/Split"),
		"Select" : require("./page/Select")
	};

	var activateTool = function(toolname) {
		if (toolname in toolset) {
			console.log("activating from toolset");
			toolset[toolname].activate();
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
		activateTool: activateTool
	};
});



