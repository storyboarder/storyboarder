define(["jsPDF", "./CanvasState", "./tools/Toolset", "./tools/SnapUtil"], function(jsPDF, canvasState, toolset, snapUtil) {
	var projectName;
	var currPageObj; // stores current page object {pageNum: <>, json: <>, thumbnail: <>}
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
			socket.send(JSON.stringify({
				projectName: projectName,
				currentPage: currPageObj.pageNum,
				delta: delta
			}));
		},
		"ToggleGrid": function(params) {
			console.log("toggle-grid");
			console.log(params);
			if (params.checked) {
				snapUtil.drawGrid(params.name);
			} else {
				snapUtil.clearGrid(params.name);
			}
		},
		"SetSnap": function(params) {
			var obj = {};
			obj[params.id] = params.value;
			snapUtil.setSnap(params.name, obj);
		},
		"PanelRows": function(params) {
			snapUtil.setPanelRows(params.value);
			snapUtil.clearPanelGrid(params.name);
			snapUtil.drawPanelGrid(params.name);
		},
		"PanelColumns": function(params) {
			snapUtil.setPanelColumns(params.value);
			snapUtil.clearPanelGrid(params.name);
			snapUtil.drawPanelGrid(params.name);
		},
		"GetChoices": function(displayChoices) {
			$.post("/projects/choices", {}, function(responseJSON) {
				var responseObject = JSON.parse(responseJSON);
				console.log("getting project choices, response: ", responseObject);
				displayChoices(responseObject);
			});
		},
		"LoadProj": function(params) {

			checkParams(params, ["name"]);
			$.post("/projects/load", {
				name: params.name
			}, function(responseJSON) {
				var responseObject = JSON.parse(responseJSON);

				console.log("LOAD PROJ, params: ", params, "response: ", responseObject);
				throwErrorIfApplicable(params);
				
				setCurrentPage(responseObject.page);
				projectName = params.name;
				numPages = responseObject.numPages;
				canvasState.load_project("canvas", currPageObj.json, params.editor.update);

				if (typeof params.callback != "undefined") {
					params.callback(responseObject);
				}
			});
		},
		"CreateProj": function(params) {
			checkParams(params, ["name"]);
			console.log("CREATE PROJ");
			var canvas = params.canvas;
			width = params.width;
			height = params.height;
			var pageMargin = params.pageMargin;
			var panelMargin = params.panelMargin;
			canvas.width = width;
			canvas.height = height;
			numPages = 0;
			projectName = params.name;

			var that = this;
			canvasState.init_project(width, height, panelMargin, pageMargin, function() {
				$.post("/projects/create", {name: params.name}, function(responseJSON) {
					var response = JSON.parse(responseJSON);
					console.log(response);
					setCurrentPage({pageNum: 0, json: "", thumbnail: ""});

					projectName = response.name;
					that.AddPage();
					activate("Select");
					if (typeof params.callback != "undefined") {
						params.callback(response);
					}
				});
			});
		},
		"CreateProjTest": function(params) {
			$.post("/projects/create", {
				name: params.name
			}, function(response) {
				responseObject = JSON.parse(response);
				console.log("Create project called with ", params, " Response: ", responseObject);
			});
		},
		"GetPage": function(params) {
			checkParams(params, ["pageNum"])
			$.post("/pages/get", {
					pageNum: params.pageNum
				},
				function(response) {
					var responseObject = JSON.parse(response);
					console.log("get page called with page ", params, " Response: ", responseObject);
					
					throwErrorIfApplicable(responseObject);

					setCurrentPage(responseObject);
					canvasState.load_page("canvas", currPageObj.json, function() {
						toolset.reactivate();
//						console.log("LOOK HERE THIS DA CANVAS", canvasState.getCanvas());
					});
					return responseObject;
				});
		},
		"DeleteProj": function(params) {
			checkParams(params, ["name"]);
			$.post("projects/delete", params, function(response) {
				responseObject = JSON.parse(response);
				console.log("Delete project called with ", params, " Response: ", responseObject);
			});
		},
		"GetAllPages": function(callback) {
			$.post("/pages/getAll", {}, function(responseJSON) {
				responseObject = JSON.parse(responseJSON);
				console.log("get all pages called, response: ", responseObject);
				callback(responseObject);
			});
		},
		"SavePage": function() {
			console.log("save called");
			if (currPageObj.pageNum <= 0 || currPageObj.pageNum > numPages) {
				throw "invalid currentPage: " + currPageObj.pageNum + "/" + numPages;
			}
			setCurrentPage({pageNum: currPageObj.pageNum, json: canvasState.getState(), thumbnail: ""}) //TODO save thumbnail

			$.post("/pages/save", getCurrentPageJSON(), function(response) {
				console.log("Save called with: ", getCurrentPageJSON(), ", response: ", JSON.parse(response));
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
		"RemovePage": function(params) {
			checkParams(params, ["pageNum"]);
			console.log("EDITOR REMOVE PAGE");
			var that = this;
			$.post("/pages/delete", {pageNum: params.pageNum}, function(responseJSON) {
				response = JSON.parse(responseJSON);
				if ("message" in response) {
					numPages--;
					if (currPageObj.pageNum == params.pageNum) { // deleted the page you're on
						console.log("deleted the page you're on (" + currPageObj.pageNum + ")");
						currPageObj.pageNum--;
						if (currPageObj.pageNum < 1) {
							currPageObj.pageNum = 1;
						}
						that.GetPage({pageNum: currPageObj.pageNum});

					} else if (currPageObj.pageNum > params.pageNum) { // deleted a page before the current page
						currPageObj.pageNum--;
					}
					console.log("EDITOR: " + currPageObj.pageNum + "/" + numPages);
				}
				if (typeof params.callback != "undefined") {
					params.callback(currPageObj.pageNum, numPages);
				}
			});
		},
		"AddPage": function(params) {
			console.log("ADD PAGE");
			numPages++;
			//TODO save previous page
			canvasState.init_page(function() {
				setCurrentPage(makePage(numPages, canvasState.getState(), ""));
				console.log(currPageObj);
				toolset.reactivate();
				$.post("/pages/add", getCurrentPageJSON(), function(response) {
					console.log("add page called with num: " + numPages + " in project " + projectName);
//					console.log("response: ", JSON.parse(response));
					console.log(currPageObj.pageNum + "/" + numPages);
					if (typeof params != "undefined" && typeof params.callback != undefined) {
						params.callback(numPages);
					}
				});
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
			console.log("MOVEPAGE");
			console.log(params);
			checkParams(params, ["pageNum", "newSpot"]);
			$.post("/pages/move", {pageNum: params.pageNum, newSpot: params.newSpot}, function(response) {
				var responseObject = JSON.parse(response);
				console.log("Move page called with: ", params);
				console.log("response: ", responseObject);
			});
		},
		"DeletePage": function(params) {
			checkParams(params, ["pageNum"]);
			$.post("/pages/delete", params, function(response) {
				var responseObject = JSON.parse(response);
				console.log("Delete page called with: ", params);
				console.log("response: ", responseObject);
			});
		},
		"Export": function(params) {
			var width = canvasState.getWidth(),
				height = canvasState.getHeight();

			var pdf = new jsPDF('portrait', 'pt', [height * 72 / 96, width * 72 / 96]);
			var $dummyCanvas = $('<canvas id="dummyCanvas"></canvas>')
				.css({ display: "none" })
				.appendTo(document.body);
			var dummyCanvas = new fabric.StaticCanvas('dummyCanvas');
			dummyCanvas.setDimensions({
				width: width,
				height: height
			});

			actions.GetAllPages(function(response) {
				console.log("All pages response: ", response);

				for (var i = 0; i < response.length; i++) {
					var page = response[i].json;
					console.log("Current: ", JSON.parse(canvasState.getState()));
					console.log("Page: ", JSON.parse(page));
					dummyCanvas.loadFromJSON(JSON.parse(page), dummyCanvas.renderAll.bind(dummyCanvas));
					var img = dummyCanvas.toDataURL('png');
					console.log(img);

					pdf.addImage(img, 'PNG', 0, 0);

					if (i+1 < response.length) pdf.addPage();
				}

				pdf.save("download.pdf");
			});
		},
		"AddImage": function(params) {
			console.log("image to be added ", params.img);
			canvasState.addImage(params.img);
		},
		"AddURL": function(params) {
			console.log("ADDING IMAGE!!!");
			if (params.url && params.url != "http://") {
				
				fabric.Image.fromURL(params.url, function(img) {
					var group = { img: img };
					canvasState.addImage(group.img);
				});
			}
		},
	};

	var setCurrentPage = function(pgObj) {
		checkPage(pgObj);
		console.log(pgObj);
		if (pgObj.json && typeof pgObj.json == "string") {
//			console.log(pgObj.json, "is a string");
			pgObj.json = JSON.parse(pgObj.json);
//			console.log("parsed to ", pgObj.json);
		}
		currPageObj = pgObj;
	};

	var getCurrentPageJSON = function() {
		return {
			pageNum: currPageObj.pageNum,
			json: JSON.stringify(currPageObj.json),
			thumbnail: currPageObj.thumbnail
		};
	};

	var checkParams = function(object, requiredParams) {
		for (var i = 0; i < requiredParams.length; i++) {
			if (!(requiredParams[i] in object)) {
				console.log(object);
				throw "ERROR: need a field: " + requiredParams[i];
			}
		}
	};

	var checkPage = function(page) {
		checkParams(page, ["pageNum", "json", "thumbnail"]);
	};

	var makePage = function(pageNum, json, thumbnail) {
		return {
			pageNum: pageNum,
			json: json,
			thumbnail: thumbnail
		}
	};

	var throwErrorIfApplicable = function(responseObject) {
		if ("error" in responseObject) {
			throw "error: " + responseObject.error;
		}
	};

	/* Initializes the Editor.
		Should be called once at the beginning of the client session. */
	var init = function(canvasId, callback) {
		if (typeof canvasState.getCanvas() != "undefined") {
			throw "Editor should not need to be initialized more than once.";
		}
		currPageObj = {};
		console.log("INIT EDITOR");
		canvasState.init("canvas");

		socket = new WebSocket("ws://localhost:8888");
		socket.onmessage = function(e) {
			var data = JSON.parse(e.data);
			if (data.projectName == projectName && data.currentPage == currPageObj.pageNum) {
				canvasState.applyDeltaToState(data.delta);
			}
//			console.log(canvasState.getCanvas());
		};

		// When its state is updated
		// save and sync the page
		// This listener gets called on undo and redo as well
		canvasState.getCanvas().on('stateUpdated', function (delta) {
			actions.SavePage();
			actions.SyncPage(delta);
		});
	};

	var activate = toolset.activate;

	var setProperty = toolset.set;

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
		var wait = 100;
		var between = 100;

		console.log("creating an empty project.");
		actions.CreateProjTest({
			name: "test_proj_dont_use"
		});

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing get page on empty file. Expecting index out of bounds. Result: ");
			actions.GetPage({
				pageNum: 0
			});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing save for empty file. Expecting index out of bounds. Result: ");
			actions.SavePageTest(makePage(1, "", ""));
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing add for empty file. Expecting success. Result: ");
			actions.AddPageTest(makePage(1, "FOOOO!", ""));
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing get page after addition of FOOOO!. Expecing something with FOOOO!. Result:");
			actions.GetPage({
				pageNum: 1
			});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing save for nonempty file. Expecting success!. Result:");
			actions.SavePageTest(makePage(1, "new String!", "foo"));
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing add for nonempty file. Expecting success!. Result:");
			actions.AddPageTest(makePage(2, "page 2", "goo"));
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("testing GetPage after previous changes. Expecting {content: New string!}. Result:");
			actions.GetPage({
				pageNum: 1
			});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Expecting {content: page 2}. Result:");
			actions.GetPage({
				pageNum: 2
			});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Testing creating a new project");
			actions.CreateProjTest({
				name: "test_proj_2_dont_use"
			});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Adding hello world to new project");
			actions.AddPageTest(makePage(1, "hello world", "akjfbad"));
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Getting hello world from new project");
			actions.GetPage({
				pageNum: 1
			});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Loading new project");
			actions.LoadProj({
				name: "test_proj_2_dont_use"
			});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Writing hey there to loaded project");
			actions.SavePageTest(makePage(1, "hey there", "garg"));
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Reading hey there from loaded project");
			actions.GetPage({pageNum: 1});
		}, wait);

		wait += between;

		window.setTimeout(function() {
			console.log(" ");
			console.log("Deleting 'test_proj_dont_use' and 'test_proj_2_dont_use'");
			actions.DeleteProj({
				name: "test_proj_dont_use"
			});
			actions.DeleteProj({
				name: "test_proj_2_dont_use"
			});
		}, wait);
	};

	return {
		init: init,
		activate: activate,
		action: action,
		setProperty: setProperty,
		test: test
	};

});