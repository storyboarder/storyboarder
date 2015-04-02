/*canvasState contains:
  canvas
  gridSpacing (width of grid squares)
  pageMargin
  panelMargin
  elements (array)
  snapOptions (object of string/boolean)
  history (History object)
  delete (function)
  add (function)
  */

/*
var CanvasState = function(canvas) {

	this.canvas = canvas;

};

CanvasState.prototype.setPageMargin = function(pageMargin) {
	this.pageMargin = pageMargin;
};

CanvasState.prototype.setPanelMargin = function(panelMargin) {
	this.panelMargin = panelMargin;
};

CanvasState.prototype.setGridSpacing = function(gridSpacing) {
	this.gridSpacing = gridSpacing;
};
*/

define(["fabricjs"], function () {

	var canvas;
	var fCanvas;
	var pageMargin = 20;
	var panelMargin = 10;
	var gridSpacing = 50;
	var elements;

	var addElement = function(e, type) {
		if (type == "panel" || type == "image" || type == "text") {
			elements.push({type:type, element: e});
			fCanvas.add(e);
			console.log(elements);
		}
	}

	var addPanel = function(x1, y1, x2, y2) {
		var panel = new fabric.Rect({
			left:x1,
			top:y1,
			width:x2 - x1,
			height: y2 - y1,
			fill:"white",
			stroke:"black",
			strokeWeight:1,
			lockMovementX:true,
			lockMovementY:true
		});
		addElement(panel, "panel");
	}

	return {
		setCanvas: function(c) {
			canvas = c;
			fCanvas = new fabric.Canvas(canvas.id, {selection:false}); 
			fCanvas.width = canvas.width;
			fCanvas.height = canvas.height;
			elements = [];
				console.log("canvas:");
			addPanel(pageMargin, pageMargin, 
					canvas.width -  pageMargin,
					canvas.height - pageMargin);
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
	    }
	};
});
