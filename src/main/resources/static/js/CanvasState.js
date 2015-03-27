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
