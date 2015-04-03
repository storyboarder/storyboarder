define(["fabricjs"], function () {

	var canvas;
	var pageMargin;
	var panelMargin;
	var gridSpacing;
	var edges; // edges of panel area
	var elements;
	var snapToGrid = false;

	var addElement = function(e, type) {
		elements.push({type:type, element: e});
		canvas.add(e);
	}

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
			hasRotatingPoint: false
		});
		panel.edges = edges;
		addElement(panel, "panel");
	}

	var deleteElement = function(e) {
		canvas.remove(e);
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
		filterMapElements: function(f, m) {
			for (e in elements.filter(f)) {
				m(elements[e]);
			}
		},

		addPanel: addPanel,

		deleteElement: deleteElement,

		/* b should be a boolean to set selectable to (for all elements of a certain type) */
		// setSelectable: function(type, b) {
		// 	for (var i = 0; i < elements.length; i++) {
		// 		if (elements[i].type == type) {
		// 			elements[i].element.set({"selectable": b});
		// 		}
		// 	}
		// }, 

		init: function(canvasId) {
			canvas = new fabric.Canvas(canvasId, {selection:false});
			elements = [];
			edges = {
				left: pageMargin,
				top: pageMargin,
				right: canvas.getWidth() - pageMargin,
				bottom: canvas.getHeight() - pageMargin
			};

			/* add the first panel */
			addPanel(edges);

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
	    }
	};

	return {
		/* this ensures all tools will get the same object */
		getCanvasState: function() { 
			return CanvasState; 
		}
	};
});
