define(["./CanvasState", "./tools/Toolset"], function(canvasState, toolset) {

  /* Actions are one-time functions, unlike tools. */
  var actions = {
    "Undo": function(params) {
    	console.log("undo called");
    },
    "Redo": function(params) {
      console.log("redo called");
    },
    "ToggleGrid": function(params) {
      console.log("toggle-grid");
      if (params.checked) {
        canvasState.drawGrid();
      } else {
        canvasState.clearGrid();
      }
    },
    "GridSpacing": function(params) {
      canvasState.setGridSpacing(params.value);
      canvasState.clearGrid();
      canvasState.drawGrid();
    },
    "Load": function(params) {
      console.log("load called");
    },
    "Save": function(params) {
      console.log("save called");
      $.post( "/savepage", {page: {}}, function( data ) {
        console.log(data);
      });
    },
    "Export": function(params) {
    },
    "Add Image" : function(params) {
    	console.log("ADDING IMAGE!!!");
    	console.log(params);
	   	if(params.url && params.url != "http://") {
	   		console.log(params.url);
			fabric.Image.fromURL(params.url, function(img) {
				img.set({ left: 30, top: 40, scaleX: 0.3, scaleY: 0.3 });
				canvasState.addElement(img, "image");
			});

	   	} else if(params.file) {
	   		console.log(params.file);

	   		/*	
			//document.getElementById('imgLoader').onchange = function handleImage(e) {
			    var reader = new FileReader();
			    reader.onload = function (event) { 
			        var imgObj = new Image();
			        imgObj.src = params.file;
			        imgObj.onload = function () {
			            // start fabricJS stuff
			            var image = new fabric.Image(imgObj);
			            image.set({
			                left: 30,
			                top: 40,
			                scaleX: 0.3,
			                scaleY: 0.3
			            });
			            //image.scale(getRandomNum(0.1, 0.25)).setCoords();
			            canvasState.addElement(image, "image");
			            
			            // end fabricJS stuff
			        } 
			    }
			    //reader.readAsDataURL(e.target.files[0]);
			//}
			*/
	   	}

    }
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
		canvasState.setGridSpacing(40); //TODO un-hardcode
		canvasState.setSnapDistance(10); //TODO un-hardcode
		console.log(canvasState.getGridSpacing());
		console.log(canvasState);
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