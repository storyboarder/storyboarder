define(["./CanvasState", "./tools/Toolset"], function(canvasState, toolset) {

	var currentPage; // index of current page
	var numPages;

	/* Actions are one-time functions, unlike tools. */
	var actions = {
		"Undo": function(params) {
			// deactivate
			canvasState.revertState();
			// activate
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

			$.post("/loadProj", params, function(responseJSON) {
				response = JSON.parse(responseJSON);
				numPages = response.numPages;
				currentPage = 1;
				canvasState.load(response.page); // parse JSON received
				return response.numPages;
			});
		},
		"CreateProj": function(params) {
			console.log("creating project with: ");
			console.log(params);
			console.log("editor init");
			var canvas = params.canvas;
			var width = params.width;
			var height = params.height;
			var pageMargin = params.pageMargin;
			var panelMargin = params.panelMargin;
			canvas.width = width;
			canvas.height = height;
			currentPage = 1;
			numPages = 1;
			//		console.log(width, height);

			canvasState.setPageMargin(pageMargin);
			//		console.log(canvasState);
			canvasState.setPanelMargin(panelMargin);
			canvasState.init(canvas.attr("id"), width, height, params.callback);

			console.log("finished initing editor");

			/* init all tools in the toolset so they get the canvas state */
			toolset.init();

			/* activate a tool to start with (esp. helpful for testing) */
			activate("Select");
			$.post("/createProj", {
				name: params.name
			}, function(response) {
				console.log(response);
			});
		},
		"CreateProjTest": function(params) {
			$.post("/createProj", {
				name: params.name
			}, function(response) {
				console.log(response);
			});
		},

		"InitProj": function(params) {
			console.log("initializing the project with: ");
			console.log(params);
			$.post("/init", params,
				function(responseJSON) {
					currentPage = 1;
					console.log(responseJSON);
				});
		},
		"GetPage": function(pageNum) {
			console.log("get page called with page", pageNum);
			$.post("/getPage", {
					page: pageNum
				},
				function(response) {
					// if (typeof response == "string") {
					// 	throw response;
					// } else {
					responseObject = JSON.parse(response);
					console.log("got: ");
					console.log(responseObject);
					currentPage = pageNum; // TODO check for errors(?)
					return responseObject;
					// }
				});
		},
		"SavePage": function() {
			console.log("save called");
			pageJSON = canvasState.getState();
			console.log(currentPage, pageJSON);
			$.post("/savePage", {
				num: currentPage,
				json: pageJSON,
				thumbnail: ""
			}, function(response) {
				console.log(JSON.parse(response));
			});
		},
		"SavePageTest": function(params) {
			console.log("save page test called with:");
			console.log(params);
			$.post("/savePage", params, function(response) {
				console.log(response);
			});
		},
		"AddPage": function() {
			console.log("add page called");
			currentPage++;
			pageJSON = canvasState.getState();
			console.log(currentPage, pageJSON);
			$.post("/addPage", {
				num: currentPage,
				json: pageJSON,
				thumbnail: ""
			}, function(response) {
				console.log(response);
			});
		},
		"AddPageTest": function(params) {
			console.log("add page test called");
			$.post("/addPage", params, function(response) {
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
		//		var canvas = spec.canvas;
		//		var width = spec.width;
		//		var height = spec.height;
		//		var pageMargin = spec.pageMargin;
		//		var panelMargin = spec.panelMargin;
		//		canvas.width = width;
		//		canvas.height = height;
		////		console.log(width, height);
		//
		//		canvasState.setPageMargin(pageMargin);
		////		console.log(canvasState);
		//		canvasState.setPanelMargin(panelMargin);
		//		canvasState.init(canvas.attr("id"), width, height, callback);
		//
		//		console.log("finished initing editor");
		//
		//		/* init all tools in the toolset so they get the canvas state */
		toolset.init();
		//
		//		/* activate a tool to start with (esp. helpful for testing) */
		//		this.activate("Select");
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
		console.log(" ");
		console.log("testing get page on empty file. Expecting index out of bounds. Result: ");
		actions.GetPage(0);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing save for empty file. Expecting index out of bounds. Result: ");
			actions.SavePageTest({
				num: 1,
				json: "",
				thumbnail: ""
			});
		}, 1000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing add for empty file. Expecting success. Result: ");
			actions.AddPageTest({
				num: 1,
				json: "FOOOO!",
				thumbnail: ""
			});
		}, 2000);


		window.setTimeout(function() {
			console.log(" ");
			console.log("testing get page after addition of FOOOO!. Expecing something with FOOOO!. Result:");
			actions.GetPage(1);
		}, 3000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing save for nonempty file. Expecting success!. Result:");
			actions.SavePageTest({
				num: 1,
				json: "new String!",
				thumbnail: "foo"
			});
		}, 4000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing add for nonempty file. Expecting success!. Result:");
			actions.AddPageTest({
				num: 2,
				json: "page 2",
				thumbnail: "goo"
			});
		}, 5000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing GetPage after previous changes. Expecting {content: New string!}. Result:");
			actions.GetPage(1);
		}, 6000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("Expecting {content: page 2}. Result:");
			actions.GetPage(2);
		}, 7000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("Testing creating a new project");
			actions.CreateProjTest({
				name: "newProject"
			});
		}, 8000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("Adding hello world to new project");
			actions.AddPageTest({
				num: 1,
				json: "hello world",
				thumbnail: "akjfbad"
			});
		}, 9000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("Getting hello world from new project");
			actions.GetPage(1);
		}, 10000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("Loading project 2");
			actions.LoadProj({
				choice: 2
			});
		}, 11000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("Writing hey there to loaded project");
			actions.SavePageTest({
				num: 1,
				json: "hey there",
				thumbnail: "garg"
			});
		}, 12000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("Reading hey there from loaded project");
			actions.GetPage(1);
		}, 13000);


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