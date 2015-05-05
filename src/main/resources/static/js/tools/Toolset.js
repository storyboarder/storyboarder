define(function(require) {
	// Name of the current tool
	var currentTool;

	// Set of available tools
	var toolset = {
		"Split": require("./panel/Split"),
		"Join": require("./panel/Join"),
		"Select": require("./page/Select"),
		"PanelSelect": require("./panel/PanelSelect"),
		"Text": require("./text/Text"),
		"Draw": require("./image/Draw"),
		"Fill": require("./image/Fill")
	};

	// Activate a tool
	var activate = function(toolname) {
		if (toolname in toolset) {
			// Deactivate previously activated tool
			if (currentTool) {
				toolset[currentTool].deactivate();
				$("." + currentTool.toLowerCase()).slideToggle();
			}
			
			// Activate the tool with toolname
			// and update current tool
			toolset[toolname].activate();
			currentTool = toolname;
		} else {
			throw "Tool not found: " + toolname;
		}
	};

	// Reactivates the current tool to account for updated canvas state
	var reactivate = function() {
		if (typeof currentTool != "undefined") {
			activate(currentTool);
		}
	};

	// Set tool property
	var set = function(toolname, property, value) {
		toolset[toolname].set(property, value);
	};

	return {
		activate: activate,
		reactivate: reactivate,
		set: set
	};
});