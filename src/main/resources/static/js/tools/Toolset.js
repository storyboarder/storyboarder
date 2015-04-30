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
		console.log(currentTool);
		if (toolname in toolset) {

			if (currentTool) { //TODO How is currentTool evaluated to a boolean?
				currentTool.deactivate();
				console.log("deactivating from toolset:", currentTool.name);
			}
			console.log("activating from toolset:", toolname);
			console.log(toolset[toolname]);
			currentTool = toolset[toolname].activate();
		} else {
			throw "Tool not found: " + toolname;
		}
	};

	return {
		init: function() {
			console.log("initing tools");
			for (var i in toolset) {
//				console.log(i);
//				console.log(toolset[i]);
				toolset[i].init();
			}
		},
		toolset: toolset,
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