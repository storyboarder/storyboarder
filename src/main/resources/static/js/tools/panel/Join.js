define(["../../CanvasState"], function (canvasState) {
	var panelEdges;
	var canvas;
	var selected = "blue";
	var deselected = "#bbb";
	var currentLine;

	var addPanelEdge = function(line) {
		canvas.add(line); /* do not add to elements array */
		panelEdges.push(line);
		line.bringToFront();
	};

	var initPanelEdge = function(coords) {
	console.log("coords of line", coords);
		var line = new fabric.Line(coords, {
			fill: 'black',
			stroke: deselected,
			strokeWidth: 1,
			selectable: true,
			padding: canvasState.getPanelMargin(),
			hasBorders: false,
			hasControls: false
		});
		return line;
	};

  var initPanelEdges = function() {
	if (panelEdges) {
	  panelEdges.map(function(e) {
		canvas.remove(e);
	  });
	}
	panelEdges = [];
	canvasState.mapElements(function(p1, rank1) {
	  if (p1.type == "panel") {
		canvasState.mapElements(function(p2, rank2) {
		  if (p2.type == "panel" && rank2 > rank1) {
			matchPanels(p1, p2);
		  }
		});
	  }
	});
	console.log(panelEdges);
  };

	var matchPanels = function(p1, p2) {
	  var line;
	  if (p1.edges.bottom == p2.edges.bottom &&
		  p1.edges.top == p2.edges.top) {
		if (p1.edges.left == p2.edges.right) {
		line = initPanelEdge([p1.edges.left, p1.edges.top, p1.edges.left, p1.edges.bottom]);
		line.leftPanel = p2;
		line.rightPanel = p1;
		line.type = "vertical";
		} else if (p1.edges.right == p2.edges.left) {
		line = initPanelEdge([p2.edges.left, p2.edges.top, p2.edges.left, p2.edges.bottom]);
		line.leftPanel = p1;
		line.rightPanel = p2;
		line.type = "vertical";
		}
	  } else if (p1.edges.left == p2.edges.left &&
		  p1.edges.right == p2.edges.right) {
		if (p1.edges.top == p2.edges.bottom) {
		line = initPanelEdge([p1.edges.left, p1.edges.top, p1.edges.right, p1.edges.top]);
		line.topPanel = p2;
		line.bottomPanel = p1;
		line.type = "horizontal";
		} else if (p1.edges.bottom == p2.edges.top) {
		line = initPanelEdge([p2.edges.left, p2.edges.top, p2.edges.right, p2.edges.top]);
		line.topPanel = p1;
		line.bottomPanel = p2;
		line.type = "horizontal";
		}
	  }
	  if (line) {
		addPanelEdge(line);
		if (line.type == "horizontal") {
		console.log(line.topPanel.edges, line.bottomPanel.edges);
	  } else {
		console.log(line.leftPanel.edges, line.rightPanel.edges);
	  }
	  }
	};

  var merge = function(p) {
	console.log("merge", p);
	var toKeep, toDelete;
	switch (p.type) {
	  case "horizontal":
		var topPanel = p.topPanel;
		var bottomPanel = p.bottomPanel;
		topPanel.edges.bottom = bottomPanel.edges.bottom;
		topPanel.height = topPanel.edges.bottom - topPanel.edges.top - 2 * canvasState.getPanelMargin();
		toDelete = bottomPanel;
		toKeep = topPanel;
		break;
	  case "vertical":
		var leftPanel = p.leftPanel;
		var rightPanel = p.rightPanel;
		leftPanel.edges.right = rightPanel.edges.right;
		leftPanel.width = leftPanel.edges.right - leftPanel.edges.left - 2 * canvasState.getPanelMargin();
		toDelete = rightPanel;
		toKeep = leftPanel;
		break;
	  default:
		console.log("unexpected type:", p.type);
		break;
	}
	console.log("p", p);
	toKeep.setCoords();
	canvas.remove(p);
	canvasState.deleteElement(toDelete);
  };

	/* activate returns this (the tool) */
	var activate = function() {

		console.log("join activated");
		initPanelEdges();

		canvasState.mapElements(
			function(e) { // map
				if (e.type == "panel") {
				  e.set({selectable: false});
				}
			}
		);
	console.log(panelEdges);

	canvas.on("object:selected", function(options) {
	  console.log(options.target);
	  merge(options.target);
	  initPanelEdges();
	});
		return this;
	};


	var deactivate = function() {
		console.log("join deactivated");
		for (var line in panelEdges) {
		  canvas.remove(panelEdges[line]);
		}
		panelEdges = [];
		canvas.__eventListeners["object:selected"] = [];
	};

	/* the following code should probably be the same for all tools */
	return {
		name: "Join",
		init: function () {
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate,
		test: function() {

		}
	};
});
