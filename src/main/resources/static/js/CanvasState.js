 define(["jquery", "fabricjs"], function($) {

 	var canvas;
 	var width;
 	var height;
 	var pageMargin;
 	var panelMargin;
 	var pageEdges; // edges of panel area (between pageMargin and panelMargin)
 	var elements;
 	var controls = ["bl", "br", "mb", "ml", "mr", "mt", "tl", "tr"];
 	var edgeDirections = ["left", "top", "right", "bottom"];

  /* snapping */
 	var snapToGrid = false;
 	var snapToPanelGrid = false;
 	var grid; // array of grid lines
 	var panelGrid;
 	var gridSpacing;
 	var panelRows;
 	var panelColumns
 	var snapDistance;
 	var gridColor = "#ddd";

 	var addElement = function(e, type) {
 		e.type = type;
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
 		//	  console.log(e);
 		var idx = elements.indexOf(e);
 		//		console.log(idx, elements);
 		if (idx >= 0) {
 			el = elements.splice(idx, 1);
 			//	    console.log(el);
 			canvas.remove(el[0]);
 		} else {
 			throw "couldn't find element:" + e;
 		}
 		//		console.log(elements.length);
 	};

 	var drawGrid = function() {
 		grid = [];
 		for (var i = 0; i < (width / gridSpacing); i++) {
 			var line = new fabric.Line(
 				[i * gridSpacing, 0, i * gridSpacing, height], {
 					stroke: gridColor,
 					selectable: false
 				}
 			);
 			canvas.add(line);
 			line.sendToBack();
 			grid.push(line);
 		}
 		for (var j = 0; j < (height / gridSpacing); j++) {
 			var line = new fabric.Line(
 				[0, j * gridSpacing, width, j * gridSpacing], {
 					stroke: gridColor,
 					selectable: false
 				}
 			);
 			canvas.add(line);
 			line.sendToBack();
 			grid.push(line);
 		}
 	};

 	var drawPanelGrid = function() {
 		panelGrid = [];
    var h = (pageEdges.bottom - pageEdges.top - 2 * panelMargin) / panelRows;
    var begin = pageEdges.top - panelMargin;
    console.log(h, begin);
 		for (var i = 0; i < panelRows; i++) {
 			var line = new fabric.Line(
 				[0, begin + h * i, width, begin + h * i], {
 					stroke: gridColor,
 					selectable: false
 				}
 			);
 			canvas.add(line);
 			line.sendToBack();
 			panelGrid.push(line);
 		}
    var w = (pageEdges.right - pageEdges.left - 2 * panelMargin) / panelColumns;
    var begin = pageEdges.left - panelMargin;
    console.log(w, begin);
 		for (var j = 0; j < panelColumns; j++) {
 			var line = new fabric.Line(
 				[begin + w * i, 0, begin + w * i, height], {
 					stroke: gridColor,
 					selectable: false
 				}
 			);
 			canvas.add(line);
 			line.sendToBack();
 			panelGrid.push(line);
 		}
 	};

 	var CanvasState = {
 		getCanvas: function() {
 			return canvas;
 		},

 		getSnapToGrid: function() {
 			return snapToGrid;
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

 		deleteElement: deleteElement,

 		init: function(canvasId, w, h) {
 			width = w;
 			height = h;
 			canvas = new fabric.Canvas(canvasId, {
 				selection: false
 			});
// 			grid = [];
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
 		},

 		addElement: addElement,

 		setPageMargin: function(p) {
 			pageMargin = p;
 		},
 		setPanelMargin: function(p) {
 			panelMargin = p;
 		},
 		setGridSpacing: function(p) {
 			gridSpacing = p;
 		},
 		setPanelRows: function(p) {
 			panelRows = p;
 		},
 		setPanelColumns: function(p) {
 			panelColumns = p;
 		},
 		setSnapDistance: function(p) {
 			snapDistance = p;
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

 		drawGrid: drawGrid,

 		drawPanelGrid: drawPanelGrid,

 		snapToGridEnabled: function() {
 			return grid.length > 0;
 		},

 		clearGrid: function() {
 			for (g in grid) {
 				canvas.remove(grid[g]);
 			}
 			grid = [];
 		},

 		clearPanelGrid: function() {
 			for (g in panelGrid) {
 				canvas.remove(panelGrid[g]);
 			}
 			panelGrid = [];
 		},

 		getGridSpacing: function() {
 			return gridSpacing;
 		},

 		getSnapDistance: function() {
 			return snapDistance;
 		}
 	};

 	return CanvasState;
 });