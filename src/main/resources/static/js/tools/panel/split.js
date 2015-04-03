define(["../../CanvasState"], function (CanvasState) {
	var previewDivideLine;
	var canvasState;
	var canvas;

	var previewDivideY = function(obj, y) {
		if (obj && obj.corners) {
		  var coords = {x1: obj.corners.left + canvasState.getPanelMargin(), 
		    y1: y, 
		    x2: obj.corners.right - canvasState.getPanelMargin(),
		    y2: y};
		  previewDivideLine.set(coords);
		  canvas.renderAll();
		}
	}

	var previewDivideX = function(obj, x) {
		if (obj && obj.corners) {
			var coords = {x1: x, 
		    	y1: obj.corners.top + canvasState.getPanelMargin(), 
		    	x2: x,
		    	y2: obj.corners.bottom - canvasState.getPanelMargin()};
		  previewDivideLine.set(coords);
		  canvas.renderAll();
		}
	}

	/* creates horizontal split */
	var divideY = function(obj, y) {
		var old = obj.corners.bottom;
		obj.corners.bottom = y;
		obj.set({height: obj.corners.bottom - obj.corners.top - 2 * canvasState.getPanelMargin()});
		canvasState.addPanel(obj.corners.left, obj.corners.bottom, obj.corners.right, old);
	}

	/* creates vertical split */
	var divideX = function(obj, x) {
		var old = obj.corners.right;
		obj.corners.right = x;
		obj.set({width: obj.corners.right - obj.corners.left - 2 * canvasState.getPanelMargin()});
		canvasState.addPanel(obj.corners.right, obj.corners.top, old, obj.corners.bottom);
	}

	var initPreviewLine = function(y) {
		var coords = [0, y, canvas.getWidth(), y];
	
		previewDivideLine = new fabric.Line(coords, {
			fill: 'black',
			stroke: 'red',
			strokeWidth: 1,
			selectable: false
		});
		canvas.add(previewDivideLine); /* does not add to elements array */
		previewDivideLine.sendToBack();
	}

	var activate = function() {
		console.log("split activated");
		canvasState.setSelectable("panel", true);

		initPreviewLine(-1); /* init line outside canvas */

		var vertical = true;
		canvas.on("mouse:move", function(options) {
			if (Math.abs(options.e.movementX) < Math.abs(options.e.movementY)) {
				previewDivideY(options.target, options.e.offsetY);
				vertical = false;
			} else {
				previewDivideX(options.target, options.e.offsetX);
				vertical = true;
			}
		});

		canvas.on("object:selected", function(options) {
			var obj = options.target;
			var x = options.e.offsetX;
			var y = options.e.offsetY;
			if (obj && obj.corners) {

				if (!vertical &&
					Math.abs(obj.corners.bottom - y) > canvasState.getPanelMargin() &&
					Math.abs(obj.corners.top - y) > canvasState.getPanelMargin()) {
					divideY(obj, y);
					canvas.deactivateAll();
				} else if (vertical &&
					Math.abs(obj.corners.right - x) > canvasState.getPanelMargin() &&
					Math.abs(obj.corners.left - x) > canvasState.getPanelMargin()) {
					divideX(obj, x);
					canvas.deactivateAll();
				}
			}
		});
	};


	var deactivate = function() {
		console.log("split deactivated");
	};

	return {
		init: function () {
			console.log("init");
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
			console.log(canvas);
		},
		activate: activate,
		deactivate: deactivate()
	}
});
