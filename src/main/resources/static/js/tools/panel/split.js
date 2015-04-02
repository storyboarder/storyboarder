/* partial functionality: only splits horizontally, and ends up with weird panels */

define(["../../CanvasState"], function (CanvasState) {
	var direction = "vertical";
	var previewDivideLine;
	var CanvasState;
	var canvas;

	// function setVerticalLine(x) {
	// 	var midptY = (obj.corners.top + obj.corners.bottom) / 2;
	// 	var coords = {
	// 		x1: obj.corners.left + 5, 
	// 		y1: y, 
	// 		x2: obj.corners.right - 5,
	// 		y2: y
	// 	};
	// 	previewDivideLine.set(coords);
	// 	canvas.add(previewDivideLine);
	// }


	function previewDivideY(obj, y) {
		if (obj && obj.corners) {
		  var midptY = (obj.corners.top + obj.corners.bottom) / 2;
		  var coords = {x1: obj.corners.left + 5, 
		    y1: y, 
		    x2: obj.corners.right - 5,
		    y2: y};
		  previewDivideLine.set(coords);
		  canvas.add(previewDivideLine);
		}
	}

	function divideY(obj, y) {
		var oldBottom = obj.corners.bottom;
		console.log("splitting panel...");
		obj.corners.bottom = y;
		console.log("y is " + y);
		console.log(obj.corners.top, obj.corners.bottom);
		console.log(obj.corners.bottom - obj.corners.top - 2 * canvasState.getPanelMargin());
		obj.set({height: obj.corners.bottom - obj.corners.top - 2 * canvasState.getPanelMargin()});
		console.log(obj);

		canvasState.addPanel(obj.corners.left, obj.corners.bottom, obj.corners.right, oldBottom, "rgba(255, 0, 0, 0.2)");
	}

	function previewDivideX(obj, x) {
	  var midptX = (obj.corners.left + obj.corners.right) / 2;
	  var coords = {x1: x, 
	    y1: obj.corners.top + 5, 
	    x2: x,
	    y2: obj.corners.bottom - 5};
	  previewDivideLine.set(coords);
	  previewDivideLine.setCoords();
	  canvas.add(previewDivideLine);
	}

	function initPreviewLine(y) {
		var coords = [0, y, canvas.getWidth(), y];
	
		previewDivideLine = new fabric.Line(coords, {
			fill: 'black',
			stroke: 'red',
			strokeWidth: 1,
			selectable: false
		});
		console.log(previewDivideLine);
		canvas.add(previewDivideLine); /* does not add to elements array */
	}

	var activate = function () {
		console.log("split activated");
		canvasState = CanvasState.getCanvasState();
		canvas = canvasState.getCanvas();
		canvasState.makeSelectable("panel");

		initPreviewLine(-1);
		console.log(canvasState);
		console.log(canvas);


		canvas.on("mouse:move", function(options) {
			//console.log(options);
			//previewDivideY(options.target, options.e.offsetY);
		});

		canvas.on("object:selected", function(options) {
			var obj = options.target;
			var y = options.e.offsetY;
			console.log(obj);
			if (obj && obj.corners) {
				divideY(obj, y);
			}
		});
	};


	var deactivate = function() {
		console.log("split deactivated");
	};

	return {
		init: function (canvasState) {
			canvasState = canvasState;
			fCanvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate()
	}
});
