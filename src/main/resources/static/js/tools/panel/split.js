define(["../../CanvasState", "../../SnapUtil"], function(canvasState, Snap) {
	var previewDivideLine;
	var canvas;
	var helperCanvas;
	var threshold = 2;
	var snap = Snap.snap;

	// Preview line to split panels
	var previewDivide = function(direction, panelEdges, pos) {
		if (direction == "horizontal") {
			var coords = {
				x1: panelEdges.left + canvasState.getPanelMargin(),
				y1: pos,
				x2: panelEdges.right - canvasState.getPanelMargin(),
				y2: pos
			};
		} else if (direction == "vertical") {
			var coords = {
				x1: pos,
				y1: panelEdges.top + canvasState.getPanelMargin(),
				x2: pos,
				y2: panelEdges.bottom - canvasState.getPanelMargin()
			};
		}

		// Set preview line coordinates and paint to canvas
		previewDivideLine.set(coords);
		helperCanvas.renderAll();
	};

	// Create split
	/*var divide = function(direction, obj, x) {
		if (direction == "vertical") {
			if (!(obj.edges.left < x && x < obj.edges.right)) {
				throw "Illegal argument: " + x;
			}
		} else if (direction == "horizontal") {
			if (!(obj.edges.top < y && y < obj.edges.bottom)) {
				throw "Illegal argument: " + y;
			}
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
			bottom: obj.edges.bottom,
		}, obj.fill);

		console.log("new", newPanel);
		obj.setCoords();
	};*/

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
			bottom: old,
		}, obj.fill);
		console.log("new", newPanel);
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
			bottom: obj.edges.bottom,
		}, obj.fill);

		console.log("new", newPanel);
		obj.setCoords();
	};


	// Intializes the preview line
	var initPreviewLine = function() {
		// Create the preview line
		// invisible on canvas
		previewDivideLine = new fabric.Line([0, 0, 0, 0], {
			stroke: 'red',
			strokeWidth: 1,
			selectable: false
		});

		// Add preview line to helper canvas
		helperCanvas.add(previewDivideLine);
	};

	// Split activate function
	var activate = function() {
		// Make all panels selectable
		canvasState.mapElements(function(e) {
			if (e.elmType == "panel") {
				e.set({ selectable: true });
			}
		});

		// Initialize preview line
		// outside of canvas
		initPreviewLine();

		canvas.deactivateAll();

		// Split direction
		var direction = "vertical";
		canvas.on("mouse:move", function(options) {
			// Exit if the item does not have edges or there is no target
			if (!options.target || !options.target.edges) return;

			canvas.deactivateAll();

			// Find point to snap to
			var point = canvasState.snapPoint({
				x: options.e.offsetX,
				y: options.e.offsetY
			});
			var x = point.x;
			var y = point.y;

			// Store the position of the line
			// (it can be x or y depeding on the direction of movement)
			var pos;
			// Change to horizontal preview line
			if (Math.abs(options.e.movementY) - Math.abs(options.e.movementX) > threshold) {
				pos = y;
				direction = "horizontal";
			// Change to vertical preview line
			} else if (Math.abs(options.e.movementX) - Math.abs(options.e.movementY) > threshold) {
				pos = x;
				direction = "vertical";
			// Preview line in the same direction
			} else {
				pos = (direction == "vertical") ? x : y;				
			}
			
			// Show preview line
			previewDivide(direction, options.target.edges, pos);
		});

		canvas.on("object:selected", function(options) {
			var obj = options.target;
			pt = canvasState.snapPoint({
				x: options.e.offsetX,
				y: options.e.offsetY
			});
			var x = pt.x;
			var y = pt.y;

			if (obj && obj.edges) {
				if (direction == "horizontal" &&
					obj.edges.bottom - y > 3 * canvasState.getPanelMargin() &&
					y - obj.edges.top > 3 * canvasState.getPanelMargin()) {
					divideY(obj, y);
					canvas.trigger("change");
				} else if (direction == "vertical" &&
					obj.edges.right - x > 3 * canvasState.getPanelMargin() &&
					x - obj.edges.left > 3 * canvasState.getPanelMargin()) {
					divideX(obj, x);
					canvas.trigger("change");
				}
			}
			canvas.deactivateAll();
		});
		//		console.log(canvas.__eventListeners);

		return this;
	};

	// Deactivate split tool
	var deactivate = function() {
		// Remove preview line
		helperCanvas.remove(previewDivideLine);
		// Deactivate event listeners
		canvas.off("mouse:move");
		canvas.off("object:selected");
	};

	// Public api for Split tools
	// (its the same for all tools)
	return {
		name: "Split",
		init: function() {
			canvas = canvasState.getCanvas();
			helperCanvas = canvasState.getHelperCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};
});