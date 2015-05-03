//TODO canvasId should probably be a module-level variable
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
	// snapUtil object
	var snap;

	// Array of deltas in history
	var history = [];
	// Index indicating the current delta
	var historyIdx = -1;
	// Previous state of the canvas (in json)
	var previousState = null;



	// Adds and element to the canvas
	// elmType could be (eg. panel, image etc.)
	var addElement = function(e, elmType) {
		e.elmType = elmType;
		canvas.add(e);
	};

	// Delete element from the canvas
	var deleteElement = function(e) {
		canvas.remove(e);
	};

	// Add image to canvas
	var addImage = function(params) {
		var img = params.img;

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

		if (params.active && params.active.elmType === "panel") {
			var panel = params.active;

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
				// edges: edges
		});
		panel.edges = edges;
		setControls(panel);
		addElement(panel, "panel");
		return panel;
	};

	// Returns the direction opposite to the one given
	var getOppositeDirection = function(edgeDir) {
		switch (edgeDir) {
			case "top":
				return "bottom";
				break;
			case "bottom":
				return "top";
				break;
			case "left":
				return "right";
				break;
			case "right":
				return "left";
				break;
			default:
				throw "Invalid edge direction " + edgeDir;
				break;
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
	};

	/* Should be called when a new page is loaded (project variables stay the same) */
	var init_page = function(callback) {
		console.log("INIT PAGE");
		if (typeof canvas === "undefined") {
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
		CanvasState.listenCanvas();

		require(["SnapUtil"], function(snapUtil) {
			snap = snapUtil;
			snap.init(CanvasState);

			if (typeof callback != "undefined") {
				callback();
			}
		});
	};
	/* Should be called when a project is loaded or created (sets project variables, initializes first page) */
	var init_project = function(w, h, panelM, pageM, callback) {
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
		init_page(callback);
	};

	var CanvasState = {
		storeState: function() {
			console.log("storing a new state...");
			var state = this.getState();

			var delta = jsondiffpatch.diff(state, previousState);
			history[++historyIdx] = delta;
			previousState = state;
			canvas.trigger('stateUpdated', jsondiffpatch.reverse(delta));

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
			socket.send(JSON.stringify(delta));
			var nextState = jsondiffpatch.patch(state, delta);
			console.log("Restore state: ", delta, " - Idx: ", historyIdx);

			// Repaint canvas
			canvas.clear().renderAll();
			canvas.loadFromJSON(nextState, canvas.renderAll.bind(canvas));

			canvas.trigger('stateUpdated', delta);
		},
		listenCanvas: function() {
			canvas.on('change', this.storeState.bind(this));
			/*canvas.on('object:modified', this.storeState.bind(this));
			canvas.on('object:added', this.storeState.bind(this));
			canvas.on('object:removed', this.storeState.bind(this));*/
		},
		unlistenCanvas: function() {
			canvas.off('change', this.storeState.bind(this));
			/*canvas.off('object:modified');
			canvas.off('object:added');
			canvas.off('object:removed');*/
		},
		getState: function() {
			var canvasState = $.extend(this.getCanvas().toJSON([
				"helper", "elmType", "edges", "lockMovementX", "lockMovementY"
			]), {
				width: width,
				height: height,
				pageMargin: pageMargin,
				panelMargin: panelMargin
			});

			// Remove helper objects from canvas
			canvasState.objects = canvasState.objects.filter(function (obj) {
				return !obj.helper;
			});

			console.log(canvasState);

			return JSON.stringify(canvasState);
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
		mapElements: function(m) {
			return canvas._objects.map(m);
		},
		filterElements: function(e) {
			return canvas._objects.filter(e);
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
		deleteElement: deleteElement,
		load_page: function(canvasId, json, callback) {
			var that = this;
			init_page(function() {
				console.log("loading from json: ", json);
				canvas.loadFromJSON(json, function() {
					canvas.renderAll.bind(canvas);
					canvas.renderAll();
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
                console.log("canvas", canvas);

				canvas.loadFromJSON(json, function() {
					console.log(canvas);
					console.log("done loading");
					canvas.renderAll.bind(canvas);
					console.log(canvas);
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
			snap.setGridSpacing(p);
		},
		setPanelRows: function(p) {
			panelRows = p;
		},
		setPanelColumns: function(p) {
			panelColumns = p;
		},
		setSnap: function(n, p) {
			snap.setSnap(n, p);
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
		},
		drawGrid: function(name) {
			snap.drawGrid(name);
		},
		clearGrid: function(name) {
			snap.clearGrid(name);
		},
		snapPoint: function(pt) {
			return snap.snapPoint(pt);
		},
		snapPointIfClose: function(pt) {
			return snap.snapPointIfClose(pt);
		},
		snapBorders: function(b, c) {
			return snap.snapBorders(b, c);
		},
		isSnapActive: function() {
			return snap.isSnapActive();
		},
		// export
	};
	return CanvasState;
});
