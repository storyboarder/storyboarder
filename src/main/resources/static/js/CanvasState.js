define(["jquery", "jsondiffpatch", "fabricjs"], function($, jsondiffpatch) {
	// Main canvas
	var canvas;
	var canvasId = "canvas";
	// Socket for multiplayer
	var socket;

	var width;
	var height;
	var pageMargin;
	var panelMargin;
	// Edges of panel area (between pageMargin and panelMargin)
	var pageEdges;

	var controls = ["bl", "br", "mb", "ml", "mr", "mt", "tl", "tr"];
	var edgeDirections = ["left", "top", "right", "bottom"];

	// Array of deltas in history
	var history = [];
	// Index indicating the current delta
	var historyIdx = -1;
	// Previous state of the canvas (in json)
	var previousState = null;

	//fiddle for copypaste http://jsfiddle.net/tkfGs/287/
	var clipboard = {
		type: "empty",
		content: "empty"
	}; //for copy paste


	// Adds and element to the canvas
	// elmType could be (eg. panel, image etc.)
	var addElement = function(e, elmType) {
		e.elmType = elmType;
		canvas.add(e);
	};

	//construct a clipboard
	var makeClipboard = function(type, content) {
		return {
			type: type,
			content: content
		};
	};

	//Event handler for copy paste (callback for document.onkeydown)
	var copyPasteHandler = function(event) {
		var key;
		if (window.event) {
			key = window.event.keyCode;
		} else {
			key = event.keyCode;
		}

		switch (key) {
			case 67: // Ctrl+C
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					copy();
				}
				break;
			case 86: // Ctrl+V
				if (event.ctrlKey || event.metaKey) {
					event.preventDefault();
					paste();
				}
		}
	}

	//copy object to clipboard
	var copy = function(params) {
		if (canvas.getActiveGroup()) {
			clipboard = makeClipboard("group", canvas.getActiveGroup());
		} else if (canvas.getActiveObject()) {
			clipboard = makeClipboard("single", canvas.getActiveObject());
		}
		console.log("copy called, clipboard: ", clipboard);
	}

	//paste object from cliboard
	var paste = function(params) {
		console.log("paste called, clipboard: ", clipboard);
		if (clipboard.type == "group") {
			var clonedObjects = [];
			var groupObjects = clipboard.content.objects;
			for (var i in groupObjects) {
				var newObj = groupObjects[i].clone();
				clonedObjects[i] = newObj;
			}
			var clonedGroup = new fabric.Group(clonedObjects, {
				left: clipboard.content.left + 20,
				top: clipboard.content.top + 20
			});
			//clipboard = makeClipboard("group", clonedGroup);
			var destroyedGroup = clonedGroup.destroy();
			var items = destroyedGroup.getObjects();
			items.forEach(function(item) {
				canvas.add(item);
			});
		} else if (clipboard.type == "single") {
			var clonedObj = clipboard.content.clone();
			clonedObj.set({
				left: clonedObj.left + 5,
				top: clonedObj.top + 5
			});
			clipboard = makeClipboard("single", clonedObj);
			canvas.add(clonedObj);
		}
		canvas.renderAll();
	};

	// Add image to canvas
	var addImage = function(params) {
		var img = params.img;
		var active = canvas.getActiveObject();

		// Set position and scale
		img.set({
			left: 100,
			top: 100,
			scaleX: 0.2,
			scaleY: 0.2
		});

		// Disable controls on image
		img.setControlsVisibility({
			mt: false,
			mb: false,
			ml: false,
			mr: false
		});

		if (active && active.elmType === "panel") {
			var panel = active;

			img.clipTo = function(ctx) {
				ctx.save();

				ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation to default for canvas
				ctx.rect(
					panel.left, panel.top, // Just x, y position starting from top left corner of canvas
					panel.width, panel.height // Width and height of clipping rect
				);

				ctx.restore();
			};

			img.set({
				left: panel.left + 15,
				top: panel.top + 15
			});
		}

		// Add image element to canvas
		addElement(img, "image");
		canvas.renderAll();
	};

	// ---
	var setControls = function(panel) {
		var bounds = [];
		var options = {};
		for (var e in edgeDirections) {
			if (pageEdges[edgeDirections[e]] == panel.edges[edgeDirections[e]]) {
				bounds.push(edgeDirections[e].substring(0, 1));
			}
		}
		for (var c in controls) {
			options[controls[c]] = true;
			for (var b in bounds) {
				if (controls[c].indexOf(bounds[b]) >= 0) {
					options[controls[c]] = false;
				}
			}
		}
		panel.setControlsVisibility(options);
	};

	/* edges should be an object with left, top, right, and bottom keys */
	var addPanel = function(edges) {
		var panel = new fabric.Rect({
			left: edges.left + panelMargin,
			top: edges.top + panelMargin,
			width: edges.right - edges.left - 2 * panelMargin,
			height: edges.bottom - edges.top - 2 * panelMargin,
			fill: "rgba(0, 0, 0, 0)", // transparent
			stroke: "black",
			strokeWeight: 1,
			lockMovementX: true,
			lockMovementY: true,
			lockScalingX: true,
			lockScalingY: true,
			hasRotatingPoint: false //,
		});
		panel.edges = edges;
		setControls(panel);
		addElement(panel, "panel");
		canvas.sendToBack(panel);
		return panel;
	};

	// Returns the direction opposite to the one given
	var getOppositeDirection = function(edgeDir) {
		var opposites = {
			"top": "bottom",
			"bottom": "top",
			"left": "right",
			"right": "left"
		};

		if (edgeDir in opposites) {
			return opposites[edgeDir];
		} else {
			throw "Invalid edge direction " + edgeDir;
		}
	};

	// Returns the dimension that corresponds to the edge
	var getDimension = function(edgeDir) {
		switch (edgeDir) {
			case "top":
			case "bottom":
				return "height";
				break;
			case "left":
			case "right":
				return "width";
				break;
			default:
				throw "Invalid edge direction " + edgeDir;
				break;
		}
	};

	// Checks if a value is between two values
	var between = function(lower, val, upper) {
		return (lower <= val && val <= upper);
	};

	//
	var contains = function(d, x) {
		var min = pageMargin + panelMargin;
		var max = canvas[getDimension(d)] - min;
		return between(min, x, max);
	};

	/* Should be called at the beginning of the entire client session (sets up fabricjs objects) */
	var init = function() {
		$canvas = $("#" + canvasId);
		canvas = new fabric.Canvas(canvasId, {
			selection: false
		});
		CanvasState.listenCanvas();
	};

	/* Should be called when a new page is loaded (project variables stay the same) */
	var init_page = function(callback) {
		console.log("INIT PAGE");
		if (typeof canvas === "undefined") {
			console.log("canvas is undefined. initing now...");
			init();
		}
		canvas.clear();
		pageEdges = {
			left: pageMargin,
			top: pageMargin,
			right: canvas.getWidth() - pageMargin,
			bottom: canvas.getHeight() - pageMargin
		};
		addPanel($.extend({}, pageEdges));
		previousState = CanvasState.getState();
		if (typeof callback !== "undefined") {
			callback();
		}
	};

	/* Should be called when a project is loaded or created (sets project variables, initializes first page) */
	var init_project = function(w, h, panelM, pageM, createProjCallback) {
		console.log("INIT PROJECT");
		if (typeof canvas === "undefined") {
			init();
		}
		width = w;
		height = h;
		pageMargin = pageM;
		panelMargin = panelM;
		canvas.setDimensions({
			width: w,
			height: h
		});
		init_page(createProjCallback);
	};

	var CanvasState = {
		storeState: function() {
			console.log("storing a new state...");
			var state = this.getState();

			var delta = jsondiffpatch.diff(state, previousState);
			history[++historyIdx] = delta;
			previousState = state;
			canvas.trigger('stateUpdated', jsondiffpatch.reverse(delta));

			// console.log("History length: ", history.length);

			return delta;
		},
		canRevert: function() {
			return historyIdx >= 0;
		},
		canRestore: function() {
			return (historyIdx <= history.length - 1);
		},
		revertState: function() {
			if (!this.canRevert()) return;

			// Move previous state one back
			var delta = history[historyIdx];
			// socket.send(JSON.stringify(delta));
			previousState = jsondiffpatch.patch(previousState, delta);
			historyIdx--;

			// Repaint canvas
			canvas.clear().renderAll();
			canvas.loadFromJSON(previousState, canvas.renderAll.bind(canvas));

			canvas.trigger('stateUpdated', delta);
		},
		restoreState: function() {
			if (!this.canRestore()) return;

			// Move prebious state one forward
			state = this.getState();
			historyIdx++;
			var delta = jsondiffpatch.reverse(history[historyIdx]);
			var nextState = jsondiffpatch.patch(state, delta);

			// Repaint canvas
			canvas.clear().renderAll();
			canvas.loadFromJSON(nextState, canvas.renderAll.bind(canvas));

			canvas.trigger('stateUpdated', delta);
		},
		listenCanvas: function() {
			canvas.on('change', this.storeState.bind(this));
		},
		unlistenCanvas: function() {
			canvas.off('change', this.storeState.bind(this));
		},
		getState: function() {

			var state = $.extend(this.getCanvas().toJSON([
				"helper", "elmType", "edges",
				"lockMovementX", "lockMovementY",
				"lockScalingX", "lockScalingY",
				"selectable", "id",
				"_controlsVisibility"
			]), {
				width: width,
				height: height,
				pageMargin: pageMargin,
				panelMargin: panelMargin
			});

			// Remove helper objects from canvas
			state.objects = state.objects.filter(function(obj) {
				return !obj.helper;
			});

//			console.log(state);

			return JSON.stringify(state);
		},
		getThumbnail: function() {
			var thumb_width = 120;

			return canvas.toDataURL({multiplier: thumb_width / width});
		},
		applyDeltaToState: function(delta) {
			this.unlistenCanvas();

			previousState = jsondiffpatch.patch(previousState, delta);
			canvas.loadFromJSON(previousState, canvas.renderAll.bind(canvas));

			this.listenCanvas();
		},
		getCanvas: function() {
			return canvas;
		},
		getWidth: function() {
			return canvas.width;
		},
		getHeight: function() {
			return canvas.height;
		},
		/* f is a filter function (takes in type/element pair, returns boolean),
			m is a map function (modifies type/element pair) */
		mapElements: function(cb) {
			return canvas.getObjects().map(cb);
		},
		filterElements: function(cb) {
			return canvas.getObjects().filter(cb);
		},
		getOppositeDirection: getOppositeDirection,
		getDimension: getDimension,
		contains: contains,
		addPanel: addPanel,
		addImage: addImage,
		setControls: setControls,
		getPageEdge: function(c) {
			return pageEdges[c];
		},
		getPageEdges: function() {
			return pageEdges;
		},
		load_page: function(canvasId, json, callback) {
			var that = this;
			init_page(function() {
				console.log("loading from json: ", json);
				canvas.loadFromJSON(json, function() {
					canvas.renderAll.bind(canvas);
					canvas.renderAll();
//					console.log(canvas);
					if (typeof callback != "undefined") {
						callback();
					}
				});
			});
		},
		load_project: function(canvasId, json, callback) {
			var that = this;
			init_project(json.width, json.height, json.panelMargin, json.pageMargin, function() {
				console.log("loading canvas from json...", json);
				canvas.loadFromJSON(json, function() {
					canvas.renderAll.bind(canvas);
					/* for text: */
					that.mapElements(
						function(found) {
							if (found.elmType === "rectext") {
								console.log("objects", canvas._objects);
								var result = canvas._objects.filter(function( obj ) {
								  return (obj.id === found.id && obj.elmType === "textBorder");
								});

								console.log("results", result);
								found.border = result[0];
								that.deleteElement(result[0]);
								that.addElement(this.border, "textBorder");
							}
						}
					);
					/* / end for text */

					canvas.renderAll();
					if (typeof callback != "undefined") {
						callback();
					}
				});
			});

			console.log("ENDING LOAD");
		},
		init: init,
		init_page: init_page,
		init_project: init_project,
		addElement: addElement,
		setPageMargin: function(p) {
			pageMargin = p;
		},
		setPanelMargin: function(p) {
			//        	throw "setting panel margin";
			panelMargin = p;
		},
		setGridSpacing: function(p) {
			// snap.setGridSpacing(p);
		},
		setPanelRows: function(p) {
			panelRows = p;
		},
		setPanelColumns: function(p) {
			panelColumns = p;
		},
		getPageMargin: function() {
			return pageMargin;
		},
		getPanelMargin: function() {
			return panelMargin;
		},
		saveCanvas: function() {
			return JSON.stringify(canvas);
		},
		loadCanvas: function(json) {
			canvas.loadFromJson(json, function() {
				canvas.renderAll();
			});
		}
	};
	return CanvasState;
});
