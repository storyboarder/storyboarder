define(["../../CanvasState"], function (CanvasState) {
	var previewDivideLine;
	var canvasState;
	var canvas;

	/* previews horizontal split */
	var previewDivideY = function(obj, y) {
		if (obj && obj.edges) {
		  var coords = {x1: obj.edges.left + canvasState.getPanelMargin(), 
		    y1: y, 
		    x2: obj.edges.right - canvasState.getPanelMargin(),
		    y2: y};
		  previewDivideLine.set(coords);
		  canvas.renderAll();
		}
	};

	/* previews vertical split */
	var previewDivideX = function(obj, x) {
		if (obj && obj.edges) {
			var coords = {x1: x, 
		    	y1: obj.edges.top + canvasState.getPanelMargin(), 
		    	x2: x,
		    	y2: obj.edges.bottom - canvasState.getPanelMargin()};
		  previewDivideLine.set(coords);
		  canvas.renderAll();
		}
	};

	/* creates horizontal split */
	var divideY = function(obj, y) {
		var old = obj.edges.bottom;
		obj.edges.bottom = y;
		obj.set({height: obj.edges.bottom - obj.edges.top - 2 * canvasState.getPanelMargin()});
		canvasState.addPanel({
			left: obj.edges.left, 
			top: obj.edges.bottom, 
			right: obj.edges.right, 
			bottom: old
		});
	};

	/* creates vertical split */
	var divideX = function(obj, x) {
		var old = obj.edges.right;
		obj.edges.right = x;
		obj.set({width: obj.edges.right - obj.edges.left - 2 * canvasState.getPanelMargin()});
		canvasState.addPanel({
			left: obj.edges.right, 
			top: obj.edges.top, 
			right: old, 
			bottom: obj.edges.bottom
		});
	};

	var initPreviewLine = function(y) {
		var coords = [0, y, canvas.getWidth(), y];
	
		previewDivideLine = new fabric.Line(coords, {
			fill: 'black',
			stroke: 'red',
			strokeWidth: 1,
			selectable: false
		});
		canvas.add(previewDivideLine); /* do not add to elements array */
		previewDivideLine.sendToBack();
	};

	/* activate returns this (the tool) */
	var activate = function() {
		console.log("split activated");
		//canvasState.setSelectable("panel", true);
		canvasState.filterMapElements(
			function(e) { // filter
				return e.type == "panel";
			},
			function(found) { // map
				found.element.set({selectable: true});
			}
		);

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
			if (obj && obj.edges) {
				if (!vertical &&
					obj.edges.bottom - y > 3 * canvasState.getPanelMargin() &&
					y - obj.edges.top > 3 * canvasState.getPanelMargin()) {
					divideY(obj, y);
				} else if (vertical &&
					obj.edges.right - x > 3 * canvasState.getPanelMargin() &&
					x - obj.edges.left > 3 * canvasState.getPanelMargin()) {
					divideX(obj, x);
				}
			}
			canvas.deactivateAll();

		});
		return this;
	};


	var deactivate = function() {
		console.log("split deactivated");
		canvas.remove(previewDivideLine);
		console.log(canvas);
	};

	/* the following code should probably be the same for all tools */
	return {
		name: "Split",
		init: function () {
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate,
		test: function() {
			console.log(canvas._objects[1]);
			divideY(canvas._objects[1], 250);
			divideY(canvas._objects[3], 450);
			divideX(canvas._objects[1], 100);
			divideX(canvas._objects[1], 300);

		}
	}
});
