define(function(require) {

	var toolset = {
		"Split" : require("./panel/Split"),
		"Select" : require("./page/Select")

	};

	var activateTool = function(toolname) {
		//testing
		// console.log("activating " + toolname + " from toolset");
		if (toolname in toolset) {
			// console.log(toolset);
			// console.log(toolname);
			// console.log(toolset[toolname]);
			toolset[toolname].activate();
		} else {
			throw "Tool not found: " + toolname;
		}
	}

	return {
		toolset: toolset,
		activateTool: activateTool
	};
});



