define(["./CanvasState", "./tools/Toolset"], function(canvasState, toolset) {

	/* Actions are one-time functions, unlike tools. */
	var actions = {
		"Undo": function(params) {
			canvasState.revertState();
		},
		"Redo": function(params) {
			canvasState.restoreState();
		},
		"ToggleGrid": function(params) {
			console.log("toggle-grid");
			console.log(params);
			if (params.checked) {
				canvasState.drawGrid(params.name);
			} else {
				canvasState.clearGrid(params.name);
			}
		},
		"SetSnap": function(params) {
		  var obj = {};
		  obj[params.id] = params.value;
			canvasState.setSnap(params.name, obj);
		},
		"PanelRows": function(params) {
			canvasState.setPanelRows(params.value);
			canvasState.clearPanelGrid(params.name);
			canvasState.drawPanelGrid(params.name);
		},
		"PanelColumns": function(params) {
			canvasState.setPanelColumns(params.value);
			canvasState.clearPanelGrid(params.name);
			canvasState.drawPanelGrid(params.name);
		},
		"GetChoices": function(displayChoices) {
			console.log("getting project choices");
			$.post("/choices", {}, function(responseJSON) {
				displayChoices(JSON.parse(responseJSON));
			});
		},
		"LoadProj": function(params) {
			console.log("loading project with:");
			console.log(params);
			$.post("/loadProj", {choice: params}, function(response) {
				console.log(response);
			});
		},
		"CreateProj": function(params) {
			console.log("creating project with: ");
			console.log(params);
			$.post("/createProj", params, function(response) {
				console.log(response);
			});
		},

		"InitProj": function(params) {
			console.log("initializing the project with: ");
			console.log(params);
			$.post("/init", params,
				function(responseJSON) {
					console.log(responseJSON);
				});
		},
		"Load": function(pageNum) {
			console.log("load called");
			$.post("/load", {
					page: pageNum
				},
				function(responseJSON) {
					responseObject = JSON.parse(responseJSON);
					console.log("loaded: ");
					console.log(responseObject);
					return responseObject;
				});
		},
		"Save": function(pageNum, pageObject) {
			console.log("save called");
			pageJSON = JSON.stringify(pageObject);
			$.post("/save", {
				page: pageNum,
				json: pageJSON
			}, function(response) {
				console.log(response);
			});
		},
		"SaveToDisk": function() {
			console.log("save to disk called");
			$.post("/saveToDisk", {}, function(response) {
				console.log(response);
			});
		},
		"Export": function(params) {
			console.log("export called");
		},
		"AddImage": function(params) {
			console.log("ADDING IMAGE!!!");
			console.log(params);
			if (params.url && params.url != "http://") { //TODO this doesn't seem right
				console.log(params.url);
				fabric.Image.fromURL(params.url, function(img) {
					img.set({
						left: 30,
						top: 40,
						scaleX: 0.3,
						scaleY: 0.3
					});
					canvasState.addElement(img, "image");
				});

			} else if (params.file) {
				console.log(params.file);
			}
		}
	};
	var init = function(spec, callback) {
	  console.log("editor init");
		var canvas = spec.canvas;
		var width = spec.width;
		var height = spec.height;
		var pageMargin = spec.pageMargin;
		var panelMargin = spec.panelMargin;
		canvas.width = width;
		canvas.height = height;
		console.log(width, height);

		canvasState.setPageMargin(pageMargin);
		console.log(canvasState);
		canvasState.setPanelMargin(panelMargin);
		canvasState.init(canvas.attr("id"), width, height, callback);
//		canvasState.setGridSpacing(40); //TODO un-hardcode
//		canvasState.setSnapDistance(10); //TODO un-hardcode
//		canvasState.setPanelRows(3);
//		canvasState.setPanelColumns(2);

		console.log("init editor");

		/* init all tools in the toolset so they get the canvas state */
		toolset.init();

		/* activate a tool to start with (esp. helpful for testing) */
		this.activate("Select");
	};

	var activate = function(toolname) {
		canvasState.storeState();

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
		console.log("testing load on empty file. Expecting index out of bounds. Result: ");
		actions.Load(0);

		window.setTimeout(function() {
			console.log("testing save for empty file. Expecting success!. Result: ");
			actions.Save(0, {
				content: "FOOOO!!!"
			});
		}, 1000);

		window.setTimeout(function() {
			console.log("testing load after addition of FOOOO!!!. Expecing {content: FOOOO!!!}. Result:");
			actions.Load(0);
		}, 2000);

		window.setTimeout(function() {
			console.log("testing save for nonempty file. Expecting success! twice. Result:");
			actions.Save(0, {
				content: "New string!"
			});
			actions.Save(1, {
				content: "Line 2!"
			});
		}, 3000);

		window.setTimeout(function() {
			console.log("testing load after previous changes. Expecting {content: New string!}. Result:");
			actions.Load(0);
		}, 4000);

		window.setTimeout(function() {
			console.log("Expecting {content: Line 2!}. Result:");
			actions.Load(1);
		}, 5000);

		window.setTimeout(function() {
			actions.GetChoices(function(choices) {
				console.log("Testing getting of choices. Expecting [test_0, test_2, test_3, test_4]");
				console.log(choices);
			});
		}, 6000);

		window.setTimeout(function() {
			console.log("Loading project 2");
			actions.LoadProj({choice: 2});
		}, 8000);

		window.setTimeout(function() {
			console.log("Writing to loaded project");
			actions.Save(0, "foo bar derp");
		}, 9000)

		window.setTimeout(function() {
			actions.SaveToDisk();
		}, 10000)

		window.setTimeout(function() {
			console.log("Testing creating a new project");
			actions.CreateProj({name: "newProject.txt"});
		}, 11000);

		window.setTimeout(function() {
			console.log("Writing to new project");
			actions.Save(0, "hello world");
		}, 12000);

		window.setTimeout(function() {
			actions.SaveToDisk();
		}, 13000)





		//toolset.test();
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