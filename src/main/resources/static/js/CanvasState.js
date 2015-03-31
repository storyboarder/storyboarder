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

define(function () {

	var canvas;
	var pageMargin = 20;
	var panelMargin = 10;
	var gridSpacing = 50;

	return {
		setCanvas: function(c) {
			canvas = c;
	    },
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
