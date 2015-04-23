define(["../../CanvasState", "../../SnapUtil"], function(canvasState, Snap) {
	var previewDivideLine;
	var canvas;
	var threshold = 2;
	var snap = Snap.snap;

	/* previews horizontal split */
	var previewDivideY = function(obj, y) {
		if (obj && obj.edges) {
			var coords = {
				x1: obj.edges.left + canvasState.getPanelMargin(),
				y1: y,
				x2: obj.edges.right - canvasState.getPanelMargin(),
				y2: y
			};
			previewDivideLine.set(coords);
			canvas.renderAll();
		}
	};

	/* previews vertical split */
	var previewDivideX = function(obj, x) {
		if (obj && obj.edges) {
			var coords = {
				x1: x,
				y1: obj.edges.top + canvasState.getPanelMargin(),
				x2: x,
				y2: obj.edges.bottom - canvasState.getPanelMargin()
			};
			previewDivideLine.set(coords);
			canvas.renderAll();
		}
	};

	/* creates horizontal split */
	var divideY = function(obj, y) {
		if (!(obj.edges.top < y && y < obj.edges.bottom)) {
			throw "Illegal argument: " + y;
		}
		var old = obj.edges.bottom;
		obj.edges.bottom = y;
		obj.set({
			height: obj.edges.bottom - obj.edges.top - 2 * canvasState.getPanelMargin()
		});
		canvasState.setControls(obj);
		var newPanel = canvasState.addPanel({
			left: obj.edges.left,
			top: y,
			right: obj.edges.right,
			bottom: old
		});
		obj.setCoords();
	};

	/* creates vertical split */
	var divideX = function(obj, x) {
		if (!(obj.edges.left < x && x < obj.edges.right)) {
			throw "Illegal argument: " + x;
		}
		var old = obj.edges.right;
		obj.edges.right = x;
		obj.set({
			width: obj.edges.right - obj.edges.left - 2 * canvasState.getPanelMargin()
		});
		canvasState.setControls(obj);
		var newPanel = canvasState.addPanel({
			left: obj.edges.right,
			top: obj.edges.top,
			right: old,
			bottom: obj.edges.bottom
		});
		obj.setCoords();
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
		previewDivideLine.bringToFront();
	};

	/* activate returns this (the tool) */
	var activate = function() {
		console.log("split activated");
		//canvasState.setSelectable("panel", true);
		canvasState.mapElements(
			function(e) { // map
				if (e.elmType == "panel") {
					e.set({
						selectable: true
					});
				}
			}
		);

		initPreviewLine(-1); /* init line outside canvas */

		canvas.deactivateAll();

		var vertical = true;
		canvas.on("mouse:move", function(options) {
			canvas.deactivateAll();
			var x = snap(options.e.offsetX);
			var y = snap(options.e.offsetY);
			if (Math.abs(options.e.movementY) - Math.abs(options.e.movementX) > threshold) {
				previewDivideY(options.target, y);
				vertical = false;
			} else if (Math.abs(options.e.movementX) - Math.abs(options.e.movementY) > threshold) {
				previewDivideX(options.target, x);
				vertical = true;
			} else {
				if (vertical) {
					previewDivideX(options.target, x);
				} else {
					previewDivideY(options.target, y);
				}
			}
		});

		canvas.on("object:selected", function(options) {
			console.log(options);
			var obj = options.target;
			var x = snap(options.e.offsetX);
			var y = snap(options.e.offsetY);
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
		console.log(canvas.__eventListeners);
		console.log(canvasState.mapElements(function(e) {
			console.log(e);
		}));

		return this;
	};


	var deactivate = function() {
		console.log("split deactivated");
		canvas.remove(previewDivideLine);
		canvas.__eventListeners["mouse:move"] = [];
		canvas.__eventListeners["object:selected"] = [];
	};

	/* the following code should probably be the same for all tools */
	return {
		name: "Split",
		init: function() {
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate,
		test: function() {
			console.log(canvas._objects[1]);
			divideX(canvas._objects[1], 300);
			divideY(canvas._objects[1], 200);
			//			divideY(canvas._objects[1], 150);
			//			divideX(canvas._objects[1], 100);
		}
	};
});