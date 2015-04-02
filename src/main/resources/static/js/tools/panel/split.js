define(function () {

	var canvasState, fCanvas;
	var direction = "vertical";

	function drawVerticalLine(x) {
		var midptY = (obj.corners.top + obj.corners.bottom) / 2;
		var coords = {
			x1: obj.corners.left + 5, 
			y1: y, 
			x2: obj.corners.right - 5,
			y2: y
		};
		previewDivideLine.set(coords);
		canvas.add(previewDivideLine);
	}

	function drawHorizontalLine(y) {
		var coords = {
			x1: 0, 
			y1: y, 
			x2: fCanvas.getWidth(),
			y2: y
		};

		fCanvas.add(new fabric.Line(coords, {
			fill: 'black',
			stroke: 'black',
			strokeWidth: 1,
			selectable: false
		}));
	}

	var activate = function () {
		fCanvas.on('mouse:move', function(options) {
			// console.log(options.e.offsetX, options.e.offsetY);
			drawHorizontalLine(options.e.offsetY);
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
