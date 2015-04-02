define(["./tools/Toolset"], function(toolset) {
	
	//console.log("editor");
	//console.log("toolset is ");
	//console.log(toolset);
	return {

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

