define(["jquery", "jsondiffpatch", "fabricjs"], function($, jsondiffpatch) {
	var canvas;
	var helperCanvas;
	var socket;

	var width;
	var height;
	var pageMargin;
	var panelMargin;
	var pageEdges; // edges of panel area (between pageMargin and panelMargin)
//    var elements;
	var controls = ["bl", "br", "mb", "ml", "mr", "mt", "tl", "tr"];
	var edgeDirections = ["left", "top", "right", "bottom"];
	var snap; // snapUtil object

	var history = [];
	var historyIdx = -1;
	var previousState = null;

	var addElement = function(e, elmType) {
		e.elmType = elmType;
//        elements.push(e);
		canvas.add(e);
	};

	var addImage = function(params) {
	  var img = params.img;
	  img.set({
		left: 100,
		top: 100,
		scaleX: 0.2,
		scaleY: 0.2
	  });

	  img.setControlsVisibility({
		  mt: false,
		  mb: false,
		  ml: false,
		  mr: false
	});

	  if(params.active && params.active.elmType === "panel") {
		var panel = params.active;

		img.clipTo = function (ctx) {
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

	  addElement(img, "image");
	  canvas.renderAll();
  }

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
			hasRotatingPoint: false//,
			// edges: edges
		});
		panel.edges = edges;
		setControls(panel);
		addElement(panel, "panel");
		return panel;
	};
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
	var between = function(lower, val, upper) {
		return (lower <= val && val <= upper);
	};
	var contains = function(d, x) {
		var min = pageMargin + panelMargin;
		var max = canvas[getDimension(d)] - min;
		return between(min, x, max);
	};
	var deleteElement = function(e) {
		canvas.remove(e);
	};
	var init = function(canvasId, w, h, callback) {
		console.log("initing page...");

		width = w;
		height = h;
		$canvas = $("#" + canvasId);
		if (typeof canvas !== "undefined") {
			canvas.dispose();
			console.log(canvas);
			canvas.selection = false;
		} else {
					canvas = new fabric.Canvas(canvasId, {
							selection: false
					});
		}
		// Create helper canvas
		console.log($("#helperCanvas").length);
		if ($("#helperCanvas").length == 0) {
			console.log("ADDING HELPER CANVAS");
					$('<canvas id="helperCanvas"></canvas>').css({
							position: "absolute",
							top: $canvas.offset().top,
							left: $canvas.offset().left
					}).insertAfter($canvas);

					helperCanvas = new fabric.Canvas("helperCanvas", {
							selection: false
					});
		} else {
			helperCanvas.dispose();
		}
		canvas.setDimensions({
			width: w,
			height: h
		});
				helperCanvas.setDimensions({
						width: w,
						height: h
				});
		console.log(canvas);
//        elements = [];
		pageEdges = {
			left: pageMargin,
			top: pageMargin,
			right: canvas.getWidth() - pageMargin,
			bottom: canvas.getHeight() - pageMargin
		};
		/* add the first panel */
		addPanel($.extend({}, pageEdges));
		/* adding a circle because why not */
//        var circle = new fabric.Circle({
//            radius: 20,
//            fill: 'green',
//            left: 100,
//            top: 100
//        });
//        canvas.add(circle);

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

	var CanvasState = {
		storeState: function() {
			console.log("storing a new state...");
			var state = this.getState();

			var delta = jsondiffpatch.diff(state, previousState);
			history[ ++historyIdx ] = delta;
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
			console.log("reverting state");
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
		listenCanvas: function () {
			canvas.on('change', this.storeState.bind(this));
			/*canvas.on('object:modified', this.storeState.bind(this));
			canvas.on('object:added', this.storeState.bind(this));
			canvas.on('object:removed', this.storeState.bind(this));*/
		},
		unlistenCanvas: function () {
			canvas.off('change', this.storeState.bind(this));
			/*canvas.off('object:modified');
			canvas.off('object:added');
			canvas.off('object:removed');*/
		},
		getState: function() {
						return JSON.stringify($.extend(this.getCanvas().toJSON([
							"elmType", "edges", "lockMovementX", "lockMovementY"]), {
								width: width,
								height: height,
								pageMargin: pageMargin,
								panelMargin: panelMargin
						}));
		},
		applyDeltaToState: function(delta) {
			this.unlistenCanvas();

			console.log("Delta: ", delta);
			console.log("Old state: ", previousState);
			previousState = jsondiffpatch.patch(previousState, delta);
			console.log("New state: ", previousState);
			canvas.loadFromJSON(previousState, canvas.renderAll.bind(canvas));

			this.listenCanvas();
		},
		getCanvas: function() {
			return canvas;
		},
		getHelperCanvas: function() {
			return helperCanvas;
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
			//elements.map(m);
			canvas._objects.map(m);
		},
		filterElements: function(e) {
//            return elements.filter(e);
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
		load: function(canvasId, json, callback) {
				console.log(json);
				var that = this;
			init(canvasId, json.width, json.height, function() {
				that.setPageMargin(json.pageMargin);
				that.setPanelMargin(json.panelMargin);
				canvas.loadFromJSON(json, function() {
					canvas.renderAll.bind(canvas);
					canvas.renderAll();
					if (typeof callback != "undefined") {
						console.log(callback);
						callback();
					}
				});
			});
		},
		init: init,
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
