define(["jsPDF", "./CanvasState", "./tools/Toolset"], function(jsPDF, canvasState, toolset) {
	var projectName;
	var currentPage; // index of current page
	var numPages;
	var socket;
	var editorObj = this;

	/* Actions are one-time functions, unlike tools. */
	var actions = {
		"Undo": function(params) {
			canvasState.revertState();
			actions.SyncPage();
		},
		"Redo": function(params) {
			canvasState.restoreState();
			actions.SyncPage();
		},
		"SyncPage": function(delta) {
			socket.send(JSON.stringify($.extend(
				delta, {
					"projectName": projectName,
					"currentPage": currentPage
				}
			)));
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
			$.post("/projects/choices", {}, function(responseJSON) {
				displayChoices(JSON.parse(responseJSON));
			});
		},
		"LoadProj": function(params) {
			checkParams(params, ["name"]);
			$.post("/projects/load", {
				choice: params.choice
			}, function(responseJSON) {
				console.log("LOAD PROJ, params: ", params, "response: ", responseJSON);
				response = JSON.parse(responseJSON);

				numPages = response.numPages;
				currentPage = response.page.num;
				console.log(currentPage + "/" + numPages);
				canvasState.load("canvas", JSON.parse(response.page.json), params.editor.init); // parse JSON received

				if (typeof params.callback != "undefined") {
					params.callback(response.numPages);
				}
			});
		},
		"CreateProj": function(params) {
			console.log("CREATE PROJ");
			var canvas = params.canvas;
			var width = params.width;
			var height = params.height;
			var pageMargin = params.pageMargin;
			var panelMargin = params.panelMargin;
			canvas.width = width;
			canvas.height = height;
			currentPage = 0;
			numPages = 0;
			console.log(currentPage, "/", numPages);

			projectName = params.name;

			canvasState.setPageMargin(pageMargin);
			canvasState.setPanelMargin(panelMargin);
			var that = this;
			canvasState.init(canvas.attr("id"), width, height, function() {
				params.callback();
				$.post("/projects/create", {
					name: params.name
				}, function(response) {
					console.log(response);
					that.AddPage();
					console.log(params.editor);
					params.editor.init();
					activate("Select");
				});
			});

			console.log("finished initing editor");

			/* init all tools in the toolset so they get the canvas state */
			//			toolset.init();

		},
		"CreateProjTest": function(params) {
			$.post("/projects/create", {
				name: params.name
			}, function(response) {
				console.log("create called with: ", params);
				console.log("response: ", JSON.parse(response));
			});
		},
		"GetPage": function(pageNum) {
			$.post("/pages/get", {
					pageNum: pageNum
				},
				function(response) {
					// if (typeof response == "string") {
					// 	throw response;
					// } else {
					console.log("get page called with page " + pageNum);
					var responseObject = JSON.parse(response);
					//					console.log("responseObj", responseObject);
					//					console.log("responseObj json", responseObject.json);
					console.log("responseObj json parsed", JSON.parse(responseObject.json));
					currentPage = pageNum; // TODO check for errors(?)
					console.log("setting currentpage to " + currentPage);
					canvasState.load("canvas", JSON.parse(responseObject.json), function() {
						console.log("hi")
					});
					return responseObject;
					// }
				});
		},
		"GetAllPages": function(callback) {
			$.post("/pages/getAll", {}, function(responseJSON) {
				console.log("get all pages called");
				console.log("response: ", JSON.parse(responseJSON));
				callback(JSON.parse(responseJSON));
			});
		},
		"SavePage": function() {
			console.log("save called");
			pageJSON = canvasState.getState();
			console.log(currentPage, pageJSON);

			var page = makePage(currentPage, pageJSON, "");

			console.log(page);

			$.post("/pages/save", page, function(response) {
				console.log("response: ", JSON.parse(response));
			});
		},
		"SavePageTest": function(page) {
			checkPage(page);
			$.post("/pages/save", page, function(response) {
				console.log("save page test called with:");
				console.log(page);
				console.log("response: ", JSON.parse(response));
			});
		},
		"AddPage": function() {
			console.log("ADD PAGE");
			currentPage++;
			numPages++;
			console.log(currentPage, "/", numPages);
			pageJSON = canvasState.getState();
			//			console.log(pageJSON);
			//			console.log(currentPage, pageJSON);
			//			console.log(makePage(currentPage, pageJSON, ""));
			$.post("/pages/add", makePage(currentPage, pageJSON, ""), function(response) {
				console.log("add page called with num: " + currentPage);
				console.log("response: ", JSON.parse(response));
			});
		},
		"AddPageTest": function(page) {
			checkPage(page);
			$.post("/pages/add", page, function(response) {
				console.log("add page test called with: ", page);
				console.log("response: ", JSON.parse(response));
			});
		},
		"MovePage": function(params) {
			checkParams(params, ["from", "to"]);
			$.post("/pages/move", params, function(response) {
				console.log("Move page called with: ", params);
				console.log("response: ", JSON.parse(response));
			});
		},
		"Export": function(params) {
			var pdf = new jsPDF();
			var dummyCanvas = new fabric.Canvas();

			actions.GetAllPages(function(response) {
				console.log(response);

				for (var i = 0; i < response.length; i++) {
					var page = response[i];
					var img = dummyCanvas.loadFromJson(page, canvas.renderAll.bind(canvas));

					pdf.addImage(img, 'JPEG', 0, 0);
				}

				pdf.save("download.pdf");
			});
		},
		"AddImage": function(params) {
			canvasState.addImage(params);
		},
		"AddURL": function(params) {
			console.log("ADDING IMAGE!!!");
			if (params.url && params.url != "http://") {
				/*				var nameArray = params.url.match(/\/(?:.(?!\/))+$/igm);
								var picName = nameArray[0].substring(1);
				*/
				fabric.Image.fromURL(params.url, function(img) {
					var group = {
						img: img,
						active: params.active
					}
					canvasState.addImage(group);
				});
			}
		},
	};

	var checkParams = function(object, requiredParams) {
		for (var i = 0; i < requiredParams.length; i++) {
			if (!(requiredParams[i] in object)) {
				throw "ERROR: need a field: " + requiredParams[i];
			}
		}
	}

	var checkPage = function(page) {
		checkParams(page, ["pageNum", "json", "thumbnail"]);
	}

	var makePage = function(pageNum, json, thumbnail) {
		//		console.log("making page with json: " + json);
		return {
			pageNum: pageNum,
			json: json,
			thumbnail: thumbnail
		}
	};

	var init = function(spec, callback) {
		//		console.trace();
		console.log("editor init");
		//		/* init all tools in the toolset so they get the canvas state */
		toolset.init();

		socket = new WebSocket("ws://localhost:8888");
		socket.onmessage = function(e) {
			var data = JSON.parse(e.data);
			if (data.projectName == projectName && data.currentPage == currentPage) {
				canvasState.applyDeltaToState(data);
			}
		};

		canvasState.getCanvas().on('stateUpdated', actions.SyncPage);
	};

	var activate = function(toolname) {
		toolset.activate(toolname);
	};

	var action = function(name, params) {
		if (name in actions) {
			params = params || {};
			params.editor = this;
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
			actions.SavePageTest(makePage(1, "", ""));
		}, 1000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing add for empty file. Expecting success. Result: ");
			actions.AddPageTest(makePage(1, "FOOOO!", ""));
		}, 2000);


		window.setTimeout(function() {
			console.log(" ");
			console.log("testing get page after addition of FOOOO!. Expecing something with FOOOO!. Result:");
			actions.GetPage(1);
		}, 3000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing save for nonempty file. Expecting success!. Result:");
			actions.SavePageTest(makePage(1, "new String!", "foo"));
		}, 4000);

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing add for nonempty file. Expecting success!. Result:");
			actions.AddPageTest(makePage(2, "page 2", "goo"));
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
			actions.AddPageTest(makePage(1, "hello world", "akjfbad"));
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
			actions.SavePageTest(makePage(1, "hey there", "garg"));
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