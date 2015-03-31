var tools = [
	"tools/page/select",
	"tools/panel/split"
	];

define(tools, function() {
	console.log("toolset called");

	return {
		"select" : require("tools/page/select"),
		"split" : require("tools/panel/split")
		// other tools go here
	}
});



