define(["fabricjs"], function () {

	var canvas;
	var pageMargin;
	var panelMargin;
	var gridSpacing;
	var elements;
	var snapToGrid = false;

	var addElement = function(e, type) {
		elements.push({type:type, element: e});
		canvas.add(e);
	}

	var addPanel = function(x1, y1, x2, y2) {
		var panel = new fabric.Rect({
			left:x1 + panelMargin,
			top:y1 + panelMargin,
			width:x2 - x1 - 2 * panelMargin,
			height: y2 - y1 - 2 * panelMargin,
			fill:"rgba(0, 0, 0, 0)", // transparent
			stroke:"black",
			strokeWeight:1,
			lockMovementX:true,
			lockMovementY:true,
			lockScalingX:true,
			lockScalingY:true
		});
		panel.corners = {left: x1,
			top: y1,
			right: x2,
			bottom: y2};
		addElement(panel, "panel");
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

		addPanel: addPanel,

		setSelectable: function(type, b) {
			for (var i = 0; i < elements.length; i++) {
				if (elements[i].type == type) {
					elements[i].element.set({"selectable": b});
				}
			}
		}, 

		init: function(canvasId) {
			console.log("state init called");
			canvas = new fabric.Canvas(canvasId, {selection:false});
			elements = [];

			/* add the first panel */
			addPanel(pageMargin, pageMargin, 
					canvas.getWidth()  - pageMargin,
					canvas.getHeight() - pageMargin);

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
		getCanvasState: function() { 
			return CanvasState; 
		}
	};
});
