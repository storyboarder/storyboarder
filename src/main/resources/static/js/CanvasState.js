define(["fabricjs"], function () {

	var canvas;
	var pageMargin;
	var panelMargin;
	var gridSpacing;
	var pageEdges; // edges of panel area (between pageMargin and panelMargin)
	var elements;
	var snapToGrid = false;
	var controls = ["bl", "br", "mb", "ml", "mr", "mt", "tl", "tr"];
	var edgeDirections = ["left", "top", "right", "bottom"];

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
	}

	var CanvasState = {
		getCanvas: function () {
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

		deleteElement: deleteElement,

		init: function(canvasId) {
			canvas = new fabric.Canvas(canvasId, {selection:false});
			elements = [];
//			panelEdges = [];
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
				radius: 20, fill: 'green', left: 100, top: 100
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
      canvas.loadFromJson(json, function(){
        canvas.renderAll();
      });
    }
	};

	return {
		/* this ensures all tools will get the same object */
		getCanvasState: function() { 
			return CanvasState; 
		}
	};
});
