define(["fabricjs"], function () {

	var fCanvas;
	var pageMargin;
	var panelMargin;
	var gridSpacing;
	var elements;
	var snapToGrid = false;

	var addElement = function(e, type) {
		console.log("add element called");
		elements.push({type:type, element: e});
		fCanvas.add(e);
		console.log(elements);
	}

	var addPanel = function(x1, y1, x2, y2) {
		console.log("adding panel...");
		var panel = new fabric.Rect({
			left:x1 + panelMargin,
			top:y1 + panelMargin,
			width:x2 - x1 - 2 * panelMargin,
			height: y2 - y1 - 2 * panelMargin,
			fill:"rgba(0, 0, 0, 0)",
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
		console.log(panel);
		addElement(panel, "panel");
	}

	//return {
	var CanvasState = {
		getCanvas: function () {
		  return fCanvas;
		},

		getSnapToGrid: function() {
			return snapToGrid;
		},

		getWidth: function() {
			return fCanvas.width;
		},

		addPanel: addPanel,

		makeSelectable: function(type) {
			for (var i = 0; i < elements.length; i++) {
				if (elements[i].type == type) {
					elements[i].element.set({"selectable": true});
				}
			}
		}, 

		init: function(canvasId) {
			fCanvas = new fabric.Canvas(canvasId, {selection:false});
			elements = [];

			addPanel(pageMargin, pageMargin, 
					fCanvas.getWidth()  - 2 * pageMargin,
					fCanvas.getHeight() - 2 * pageMargin);

		  var circle = new fabric.Circle({
			  radius: 20, fill: 'green', left: 100, top: 100
		  });
		  fCanvas.add(circle);
		  console.log("canvas initialized.");
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
			console.log("getting canvas state");
			return CanvasState; 
		}
	};
});
