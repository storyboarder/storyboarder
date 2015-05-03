define(function(require) {
	var currentTool = null;
	// Set of available tools
	var toolset = {
		"Split": require("./panel/Split"),
		"Join": require("./panel/Join"),
		"Select": require("./page/Select"),
		"Text": require("./text/Text"),
		"Draw": require("./image/Draw"),
		"Fill": require("./image/Fill")
	};

	// Activate a tool
	var activate = function(toolname) {
		if (toolname in toolset) {
			// Deactivate previously activated tool
			if (currentTool) toolset[currentTool].deactivate();
			
			// Activate the tool with toolname
			// and update current tool
			toolset[toolname].activate();
			currentTool = toolname;
		} else {
			throw "Tool not found: " + toolname;
		}
	};

	// Set tool property
	var set = function(toolname, property, value) {
		toolset[toolname].set(property, value);
	};

	return {
		activate: activate,
		set: set
	};
});