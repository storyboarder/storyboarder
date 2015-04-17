define(["./CanvasState", "./tools/Toolset"], function(canvasState, toolset) {

  /* Actions are one-time functions, unlike tools. */
  var actions = {
    "Undo": function(params) {
      console.log("undo called");
    },
    "Redo": function(params) {
      console.log("redo called");
    },
    "Load": function(params) {
      console.log("load called");
    },
    "Save": function(params) {
      console.log("save called");
//      $.post( "/save", {}, function( data ) {
//        console.log(data);
//      });
    },
    "Export": function(params) {
      console.log("save called");
    },
  };

	var init = function(spec) {
		var canvas = spec.canvas;
		var width = spec.width;
		var height = spec.height;
		var pageMargin = spec.pageMargin;
		var panelMargin = spec.panelMargin;
		canvas.width = width;
		canvas.height = height;
		console.log(width, height);

		canvasState.setPageMargin(pageMargin);
		canvasState.setGridSpacing(20); //TODO un-hardcode
		canvasState.setPanelMargin(panelMargin);
		canvasState.init(canvas.attr("id"), width, height);

		console.log("init editor");

		/* init all tools in the toolset so they get the canvas state */
		toolset.init();

		/* activate a tool to start with (esp. helpful for testing) */
		this.activate("Select");
	};

	var activate = function(toolname) {
		toolset.activate(toolname);
	};

	var action = function(name, params) {
	  if (name in actions) {
      actions[name](params);
    } else {
      throw "Action not found: " + name;
    }
	};

	var test = function() {
		toolset.test();
		// console.log("editor tested");
		// console.log("toolset is now " + toolset);
		// console.log("test activating Split...");
		//console.log("activating split from editor 2");

		//this.activateTool("Split");
		// console.log(canvasState.getPageMargin());
	};

	return {
		init: init,
		activate: activate,
		action: action,
		test: test
	};

});