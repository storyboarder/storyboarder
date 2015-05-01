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

			if (typeof currentTool != "undefined") { //TODO How is currentTool evaluated to a boolean?
				currentTool.deactivate();
			}
			console.log("activating from toolset:", toolname);
			currentTool = toolset[toolname].activate();
		} else {
			throw "Tool not found: " + toolname;
		}
	};

	return {
		init: function() {
			for (var i in toolset) {
				toolset[i].init();
			}
			activate("Select");
		},
		activate: activate,
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