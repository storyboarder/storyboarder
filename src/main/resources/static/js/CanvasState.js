define(["jquery", "jsondiffpatch", "fabricjs"], function($, jsondiffpatch) {

 	var canvas;
 	var width;
 	var height;
 	var pageMargin;
 	var panelMargin;
 	var pageEdges; // edges of panel area (between pageMargin and panelMargin)
 	var elements;
 	var controls = ["bl", "br", "mb", "ml", "mr", "mt", "tl", "tr"];
 	var edgeDirections = ["left", "top", "right", "bottom"];

  var snap; // snapUtil object

 	var addElement = function(e, elmType) {
 		e.elmType = elmType;
 		elements.push(e);
 		canvas.add(e);
 	};

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
 			hasRotatingPoint: false,
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
 		var idx = elements.indexOf(e);
 		if (idx >= 0) {
 			el = elements.splice(idx, 1);
 			canvas.remove(el[0]);
 		} else {
 			throw "couldn't find element:" + e;
 		}
 	};

 	var CanvasState = {
 		history: [],
 		historyIdx: -1,
 		previousState: null,

 		storeState: function () {
// 			console.log("Diff patch: ", jsondiffpatch);
//			var state = this.getState();
//
//			// If there is history
//			if (this.canRevert()) {
//				var delta = jsondiffpatch.diff(state, previousState);
//	 			this.history.push(delta);
//			}
//
//			this.historyIdx++;
// 			this.previousState = state;
 		},

 		canRevert: function () {
 			return this.historyIdx >= 0;
 		},

 		canRestore: function () {
 			return (this.historyIdx >= this.history.length-1);
 		},

 		revertState: function () {
 			if (!this.canRevert()) return;

 			// Repaint canvas
			canvas.clear().renderAll();
			console.log(this.previousState);
			canvas.loadFromJSON(this.previousState, canvas.renderAll.bind(canvas));

			// Move previous state one back
 			this.historyIdx--;
 			if (this.canRevert()) {	
 				var prevDelta = this.history[this.historyIdx];
				this.previousState = jsondiffpatch.patch(this.previousState, prevDelta);	
 			} else {
 				this.previousState = null;
 			}
 		},

 		restoreState: function () {
 			if (!this.canRestore()) return;

 			// Move prebious state one forward
			this.previousState = this.getState();
			this.historyIdx++;
 			console.log("History: ", this.history);
 			var delta = this.history[this.historyIdx];
 			var nextState = jsondiffpatch.patch(this.previousState, delta);

 			// Repaint canvas
			canvas.clear().renderAll();
			canvas.loadFromJSON(nextState, canvas.renderAll.bind(canvas));
 		},

 		getState: function () {
 			return this.getCanvas().toJSON(["elmType"]);
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
 			elements.map(m);
 		},

 		filterElements: function(e) {
 			return elements.filter(e);
 		},

 		getOppositeDirection: getOppositeDirection,

 		getDimension: getDimension,

 		contains: contains,

 		addPanel: addPanel,

 		setControls: setControls,

 		getPageEdge: function(c) {
 			return pageEdges[c];
 		},

 		getPageEdges: function() {
 		  return pageEdges;
 		},

 		deleteElement: deleteElement,

 		load: function(json) {
 		  console.log("loading project...");
 		  console.log(json);

 		  // TODO replace this with json parsing:
 		  init("canvas", 400, 600, function() {});
 		},

 		init: function(canvasId, w, h, callback) {
 			width = w;
 			height = h;
 			canvas = new fabric.Canvas(canvasId, {
 				selection: false
 			});
 			canvas.setDimensions({
 				width: w,
 				height: h
 			});
 			elements = [];
 			pageEdges = {
 				left: pageMargin,
 				top: pageMargin,
 				right: canvas.getWidth() - pageMargin,
 				bottom: canvas.getHeight() - pageMargin
 			};

 			/* add the first panel */
 			addPanel($.extend({}, pageEdges));

 			/* adding a circle because why not */
 			var circle = new fabric.Circle({
 				radius: 20,
 				fill: 'green',
 				left: 100,
 				top: 100
 			});
 			canvas.add(circle);

      var that = this;
 			require(["SnapUtil"], function(snapUtil) {
 			  snap = snapUtil;
 			  snap.init(that);
 			  console.log("init", snap);
 			  if (typeof callback != "undefined") {
 			    callback();
 			  }
 			});
 		},

 		addElement: addElement,

 		setPageMargin: function(p) {
 			pageMargin = p;
 		},

 		setPanelMargin: function(p) {
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
 		  console.log("set snap" + snap);
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
 	};

 	return CanvasState;
 });
