define(function(require) {

	var currentTool;

	var toolset = {
		"Split": require("./panel/Split"),
		"Join": require("./panel/Join"),
		"Select": require("./page/Select"),
		"Text": require("./text/Text"),
		"Draw": require("./image/Draw"),
		"Fill": require("./image/Fill")
	};

	var activate = function(toolname) {
		if (toolname in toolset) {
			console.log(toolname);

			if (typeof currentTool != "undefined") { //TODO How is currentTool evaluated to a boolean?
				currentTool.deactivate();
			}
			
			console.log("activating from toolset:", toolname);
			console.log(toolname, toolset, toolset[toolname]);
			currentTool = toolset[toolname].activate();
		} else {
			throw "Tool not found: " + toolname;
		}
	};

	var set = function(toolname, property, value) {
		console.log("setting prop");
		console.log(toolname, property, value);
		toolset[toolname].set(property, value);
	};

	return {
		activate: activate,
		set: set,
		test: function() {
			//TODO could this cause issues when doing asynchronous operations?
			activate("Split");
			currentTool.test();
			activate("Join");
			currentTool.test();
			activate("Test");
			currentTool.test();
		}
	};
});