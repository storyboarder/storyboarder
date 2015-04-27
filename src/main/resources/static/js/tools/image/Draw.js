define(["../../CanvasState"], function (canvasState) {
		
    
		var activate = function() {

      console.log("draw activated");

      canvas.isDrawingMode = true;
      fabric.Object.prototype.transparentCorners = false;
      var drawingColor = $('#drawing-color'),
      drawingLineWidth = $('#drawing-line-width')

      canvas.freeDrawingBrush.color = drawingColor[0].value;
      canvas.freeDrawingBrush.width = parseInt(drawingLineWidth[0].value, 10) || 1;

      $('#eraser').click(function() {
        console.log('eraser!');
        canvas.freeDrawingBrush.color = 'white';
      });

      $('#drawing-color').click(function() {
        console.log('color!');
        canvas.freeDrawingBrush.color = drawingColor[0].value;
      });

      $('#drawing-line-width').click(function() {
        console.log('width!');
        canvas.freeDrawingBrush.width = parseInt(drawingLineWidth[0].value, 10);
      });


      return this;

		};

		var deactivate = function() {
			console.log("draw deactivate");
      canvas.isDrawingMode = false;
      fabric.Object.prototype.transparentCorners = true;
		};

	
	return {
		name: "Draw",
		init: function () {
			console.log("init draw");
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};
	
});