define(["../../CanvasState"], function (canvasState) {

    //bug: clicking on draw right after

    var start = 0;
    var times = 0;

		var activate = function() {

      start = canvas._objects.length;
      console.log("start " + start);

      console.log("draw activated");

      canvas.isDrawingMode = true;
      //fabric.Object.prototype.transparentCorners = false;

      canvas.freeDrawingBrush.color = $('#drawing-color').val();
      canvas.freeDrawingBrush.width = $('#drawing-line-width').val();
      
      $('#drawing-color').change(function () {
        console.log('color!');
        canvas.freeDrawingBrush.color = $('#drawing-color').val();
      });

      $('#drawing-line-width').change(function () {
        console.log('width!');
        canvas.freeDrawingBrush.width = $('#drawing-line-width').val();
      });

      canvas.on("mouse:up", function () {
        times++;
        console.log(times);
      });

      return this;

		};

		var deactivate = function() {
			console.log("draw deactivate");
      console.log("CANVAS");
      console.log(canvas);
      console.log("times " + times);
      var group = [];
      var i;

      for(i = start; i <= times + 1; i++) {
        group.push(canvas._objects[i]);
      }

      var toAdd = new fabric.Group(group);
      canvas._objects.splice(start, times);
      console.log(toAdd);
      // DOESN'T LIKE ADDELEMENT FOR SOME REASON
      //canvas.add(toAdd);
      canvasState.addElement(toAdd, "draw");
      toAdd.hasControls = true;
      //canvas.renderAll();

      canvas.isDrawingMode = false;
      fabric.Object.prototype.transparentCorners = true;
      canvas.__eventListeners["mouse:up"] = [];

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