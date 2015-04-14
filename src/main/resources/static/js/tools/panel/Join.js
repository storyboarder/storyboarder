define(["../../CanvasState"], function (CanvasState) {
	var previewLines;
	var canvasState;
	var canvas;

	var initPreviewLine = function(coords) {
    console.log("coords of line", coords);
		var line = new fabric.Line(coords, {
			fill: 'black',
			stroke: 'blue',
			strokeWidth: 1,
			selectable: true,
			padding: canvasState.getPanelMargin(),
			hasBorders: false,
			hasControls: false
		});
		canvas.add(line); /* do not add to elements array */
		previewLines.push(line);
		line.bringToFront();
		return line;
	};

  var merge = function(p) {
    console.log("merge", p);
    var toKeep, toDelete;
    switch (p.type) {
      case "horizontal":
        var topPanel = p.topPanel;
//        console.log("top pane starting", topPanel);
        var bottomPanel = p.bottomPanel;
        topPanel.edges.bottom = bottomPanel.edges.bottom;
        topPanel.height = topPanel.edges.bottom - topPanel.edges.top - 2 * canvasState.getPanelMargin();
//        console.log("topPanel ending", topPanel);
        toDelete = bottomPanel;
        toKeep = topPanel;
        break;
      case "vertical":
        var leftPanel = p.leftPanel;
        var rightPanel = p.rightPanel;
        leftPanel.edges.right = rightPanel.edges.right;
        leftPanel.width = leftPanel.edges.right - leftPanel.edges.top - 2 * canvasState.getPanelMargin();
        toDelete = rightPanel;
        toKeep = leftPanel;
        break;
      default:
        console.log("unexpected type:", p.type);
        break;
    }
    console.log("p", p);
    canvasState.removePanelEdge({topPanel: p.topPanel, bottomPanel: p.bottomPanel});
    canvasState.mapPanelEdges(
      function(p) {
        console.log("p", p);
        console.log("toDelete", toDelete);
        if (p.topPanel == toDelete) {
          p.topPanel = toKeep;
//          console.log("yes");
        } else if (p.left == toDelete) {
          p.left = toKeep;
        }
//        console.log(p.topPanel.edges);
//        console.log(p.bottomPanel.edges);
      }
    );
    canvasState.deleteElement(bottomPanel);
//    console.log(previewLines);
//    canvasState.mapElements(function (e) { console.log(e); });
  };

	/* activate returns this (the tool) */
	var activate = function() {

    previewLines = [];
		console.log("join activated");

		canvasState.mapElements(
			function(e) { // map
				if (e.type == "panel") {
				  e.set({selectable: false});
				}
			}
		);

    canvasState.mapPanelEdges(
      function (p) {
        var coords;
        var pEdges;
        console.log(p.type);
        switch (p.type) {
          case "horizontal":
            pEdges = p.topPanel.edges;
            coords = [pEdges.left, pEdges.bottom, pEdges.right, pEdges.bottom];
            break;
          case "vertical":
            pEdges = p.leftPanel.edges;
            coords = [pEdges.right, pEdges.top, pEdges.right, pEdges.bottom];
            break;
          default:
            console.log("unexpected type:", p.type);
            break;
        }
        var line = initPreviewLine(coords);
        for (var k in p) { // attach references to panels and type
          line[k] = p[k];
        }
      }
    );
//    console.log("preview lines", previewLines);
//		initPreviewLine(-1); /* init line outside canvas */
//
//		var vertical = true;
//		canvas.on("mouse:move", function(options) {
//			if (Math.abs(options.e.movementX) < Math.abs(options.e.movementY)) {
//				previewDivideY(options.target, options.e.offsetY);
//				vertical = false;
//			} else {
//				previewDivideX(options.target, options.e.offsetX);
//				vertical = true;
//			}
//		});
      console.log(previewLines);
      canvas.on("object:selected", function(options) {
        console.log(options.target);
        merge(options.target);
        canvasState.mapPanelEdges( function(p) {
                console.log(p.topPanel.edges, p.bottomPanel.edges);
                });

      });
//
		return this;
	};


	var deactivate = function() {
		console.log("join deactivated");
		for (var line in previewLines) {
		  canvas.remove(previewLines[line]);
		}
		previewLines = [];
		canvas.__eventListeners["mouse:move"] = [];
		canvas.__eventListeners["object:selected"] = [];
	};

	/* the following code should probably be the same for all tools */
	return {
		name: "Join",
		init: function () {
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate,
		test: function() {

		}
	}
});
