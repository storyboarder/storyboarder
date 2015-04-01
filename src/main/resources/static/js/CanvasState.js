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

	return {
		setCanvas: function(c) {
			canvas = c;
			fCanvas = new fabric.Canvas(canvas.id, {selection:false}); 
			fCanvas.width = canvas.width;
			fCanvas.height = canvas.height;
			elements = [];
			var circle = new fabric.Circle({
				  radius: 20, fill: 'green', left: 100, top: 100
			});
			fCanvas.add(circle);
			var firstPanel = new fabric.Rect({
				/*
				left:pageMargin,
				top:pageMargin,
				width:canvas.width - 2 * pageMargin,
				height: canvas.height - 2 * pageMargin,
				*/
				left:20,
				top:20,
				width:50,
				height:50,
				fill:"red",
				stroke:"black",
				strokeWeight:5,
				lockMovementX:true,
				lockMovementY:true
			});
			addElement(firstPanel, "panel");
			console.log("canvas:");
			console.log(fCanvas);
			//console.log(fCanvas);
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
