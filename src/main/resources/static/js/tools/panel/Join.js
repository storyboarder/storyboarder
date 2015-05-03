define(["../../CanvasState"], function(canvasState) {
	var canvas;
	var panelEdges = [];
	var selected = "blue";
	var deselected = "#bbb";

	// Adds a join indicator to the canvas
	var addJoinIndicator = function(coords, props) {
		var line = new fabric.Line(coords, $.extend({
			stroke: deselected,
			strokeWidth: 1,
			selectable: true,
			padding: canvasState.getPanelMargin(),
			hasBorders: false,
			hasControls: false,
			helper: true
		}, props));

		canvas.add(line);
		panelEdges.push(line);

		return line;
	};

	// Empties join idicators array
	// and removes them from canvas
	var clearJoinIndicators = function () {
		// * DO NOT REMOVE BIND(CANVAS)
		panelEdges.forEach(canvas.remove.bind(canvas));
		panelEdges = [];
	};

	// Calculates which panels can be joined
	// and shows join indicators for those panels
	var initJoinIndicators = function() {
		// Remove previous indicators
		clearJoinIndicators();

		// Loop though each panel
		// against every other panel
		canvasState.mapElements(function(panel1, idx1) {
			if (panel1.elmType != "panel") return;

			canvasState.mapElements(function(panel2, idx2) {
				if (panel2.elmType == "panel" && idx2 > idx1) {
					matchPanels(panel1, panel2);
				}
			});
		});
	};

	// Checks if two panels share sides
	// and if yes shows a join indicator
	var matchPanels = function(p1, p2) {
		// If two panels align top and bottom
		if (p1.edges.bottom == p2.edges.bottom &&
			p1.edges.top == p2.edges.top) {
			// Find which is the left and which the right
			var leftPanel = p1,
				rightPanel = p2;
			if (p1.edges.left == p2.edges.right) {
				leftPanel = p2;
				rightPanel = p1;
			}

			// Show indicator that they can be joined
			addJoinIndicator([
				leftPanel.edges.right, leftPanel.edges.top, leftPanel.edges.right, leftPanel.edges.bottom
			], {
				leftPanel: leftPanel,
				rightPanel: rightPanel,
				direction: "vertical"
			});
		// If two panels align left and right
		} else if (p1.edges.left == p2.edges.left &&
			p1.edges.right == p2.edges.right) {
			// Find which panel is top and which bottom
			var topPanel = p1,
				bottomPanel = p2;
			if (p1.edges.top == p2.edges.bottom) {
				topPanel = p2;
				bottomPanel = p1;
			}

			// Show indicator that they can be joined
			addJoinIndicator([
				topPanel.edges.left, topPanel.edges.bottom, topPanel.edges.right, topPanel.edges.bottom
			], {
				topPanel: topPanel,
				bottomPanel: bottomPanel,
				direction: "horizontal"
			});
		}
	};

	// Merges two panels given the join indicator
	var merge = function(p) {
		var toResize, toDelete;
		switch (p.direction) {
			case "horizontal":
				var topPanel = p.topPanel;
				var bottomPanel = p.bottomPanel;

				topPanel.edges.bottom = bottomPanel.edges.bottom;
				topPanel.height = topPanel.edges.bottom - topPanel.edges.top - 2 * canvasState.getPanelMargin();

				toDelete = bottomPanel;
				toResize = topPanel;
				break;
			case "vertical":
				var leftPanel = p.leftPanel;
				var rightPanel = p.rightPanel;

				leftPanel.edges.right = rightPanel.edges.right;
				leftPanel.width = leftPanel.edges.right - leftPanel.edges.left - 2 * canvasState.getPanelMargin();

				toDelete = rightPanel;
				toResize = leftPanel;
				break;
			default:
				throw "Unexpected direction: " + p.direction;
				break;
		}

		// Update size and coordinates
		toResize.setCoords();
		// Remove joined panel and indicator
		canvas.remove(p);
		canvas.remove(toDelete);
		// Triger change event
		canvas.trigger("change");
	};

	// Activate join tool
	var activate = function() {
		// Get canvas
		canvas = canvasState.getCanvas();

		initJoinIndicators();

		canvasState.mapElements(function(e) { // map
			if (e.elmType == "panel") {
				e.set({
					selectable: false
				});
			}
		});

		// Listen for click event to join panels
		canvas.on("object:selected", function(options) {
			merge(options.target);
			initJoinIndicators();
		});

		return this;
	};

	// Deactivate join tool
	var deactivate = function() {
		clearJoinIndicators();
		canvas.off("object:selected");
	};

	// Join tool public api
	return {
		name: "Join",
		activate: activate,
		deactivate: deactivate
	};
});