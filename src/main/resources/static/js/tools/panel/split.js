define(["../../CanvasState", "../SnapUtil"], function(canvasState, snapUtil) {
	var previewDivideLine;
	var canvas;
	var threshold = 2;

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
		canvas.renderAll();
	};


	// Create split
	var divide = function(direction, obj, pos) {
		var panelEdges = obj.edges;
		var newDimensions, newPanelCoords;

		// Horizontal split
		if (direction == "horizontal") {
			if (!(panelEdges.top < pos && pos < panelEdges.bottom)) {
				throw "Split position " + pos + " is out of the target panel.";
			}
			// New height of the old panel
			newDimensions = {
				height: pos - panelEdges.top - 2 * canvasState.getPanelMargin()
			};
			// Coordinates of the new panel
			console.log(obj.fill);
			newPanelCoords = $.extend({}, panelEdges, {
				top: pos
			});
			// Update the edges of the old panel
			obj.edges.bottom = pos;

		// Vertical split
		} else if (direction == "vertical") {
			if (!(panelEdges.left < pos && pos < panelEdges.right)) {
				throw "Split position " + pos + " is out of the target panel.";
			}
			// New width of the old panel
			newDimensions = {
				width: pos - panelEdges.left - 2 * canvasState.getPanelMargin()
			};
			// Coordinates of the new panel
			newPanelCoords = $.extend({}, panelEdges, {
				left: pos
			});
			// Update the edges of the old panel
			obj.edges.right = pos;
		}

		// Resize the old panel
		obj.set(newDimensions);
		canvasState.setControls(obj);
		// Add another panel
		canvasState.addPanel(newPanelCoords, obj.fill);
		obj.setCoords();
	};


	// Intializes the preview line
	var initPreviewLine = function() {
		// Create the preview line
		// invisible on canvas
		previewDivideLine = new fabric.Line([0, 0, 0, 0], {
			stroke: 'red',
			strokeWidth: 1,
			selectable: false,
			helper: true
		});

		// Add preview line to helper canvas
		canvas.add(previewDivideLine);
	};

	// Split activate function
	var activate = function() {
		// Get canvas
		canvas = canvasState.getCanvas();

		// Make all panels selectable
		canvasState.mapElements(function(e) {
			if (e.elmType == "panel") {
				e.set({ selectable: true });
			} else {
				e.set({ selectable: false });
			}
		});

		// Initialize preview line
		// outside of canvas
		initPreviewLine();

		canvas.deactivateAll();

		// Split direction
		var direction = "vertical";
		var target;

		canvas.on("mouse:move", function(options) {
			// Continue only if the item has edges and there is a target
			console.log(options);
			var pt = new fabric.Point(options.e.offsetX, options.e.offsetY);
			console.log(pt);
			canvasState.mapElements(function (e) {
				if (e.elmType == "panel" && e.containsPoint(pt)) {
					target = e;
					console.log(target);
				}
			});
			console.log(target);
			if (!target || !target.edges) return;

			canvas.deactivateAll();

			// Find point to snap to
			var point = snapUtil.snapPoint({
				x: options.e.offsetX,
				y: options.e.offsetY
			});

			// Store the position of the line
			// (it can be x or y depeding on the direction of movement)
			var pos;
			// Change to horizontal preview line
			if (Math.abs(options.e.movementY) - Math.abs(options.e.movementX) > threshold) {
				pos = point.y;
				direction = "horizontal";
			// Change to vertical preview line
			} else if (Math.abs(options.e.movementX) - Math.abs(options.e.movementY) > threshold) {
				pos = point.x;
				direction = "vertical";
			// Preview line in the same direction
			} else {
				pos = (direction == "vertical") ? point.x : point.y;				
			}
			
			// Show preview line
			previewDivide(direction, target.edges, pos);
		});

		canvas.on("mouse:down", function(options) {
			console.log(target);
			// Continue only if the item has edges and there is a target
			if (!target || !target.edges) return;
			// Edges of target panel
			var panelEdges = target.edges;

			// Find point to snap to
			var point = snapUtil.snapPoint({
				x: options.e.offsetX,
				y: options.e.offsetY
			});
			var x = point.x;
			var y = point.y;

			// Store the position of the line
			// (it can be x or y depeding on the direction of movement)
			var pos;

			// Makes sure the panel is not too small as well
			if (direction == "horizontal" &&
				panelEdges.bottom - y > 3 * canvasState.getPanelMargin() &&
				y - panelEdges.top > 3 * canvasState.getPanelMargin()) {
				pos = y;
			} else if (direction == "vertical" &&
				panelEdges.right - x > 3 * canvasState.getPanelMargin() &&
				x - panelEdges.left > 3 * canvasState.getPanelMargin()) {
				pos = x;
			}

			// Divide panels and trigger chagne event
			divide(direction, target, pos);
			canvas.deactivateAll();
			canvas.trigger("change");
		});

		return this;
	};


	// Deactivate split tool
	var deactivate = function() {
		// Remove preview line
		canvas.remove(previewDivideLine);
		// Deactivate event listeners
		canvas.off("mouse:move");
		canvas.off("mouse:down");
	};


	// Public api for Split tools
	// (its the same for all tools)
	return {
		name: "Split",
		activate: activate,
		deactivate: deactivate
	};
});