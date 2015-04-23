//TODO: fix bug with resizing panels outside of valid page area

define(["../../CanvasState", "../../SnapUtil"], function(canvasState, Snap) {

	var canvas;
	var snap = Snap.snap;
	var setLeft = Snap.setLeft;
	var setRight = Snap.setRight;
	var setTop = Snap.setTop;
	var setBottom = Snap.setBottom;
	var getLeft = Snap.getLeft;
	var getRight = Snap.getRight;
	var getTop = Snap.getTop;
	var getDist = Snap.getDist;
	var getBottom = Snap.getBottom;

	var resizeOneDirection = function(dir, obj, newEdges, isOpposite) {
		var opposite = canvasState.getOppositeDirection(dir);
		var oldEdges = obj.edges;
		canvasState.mapElements(
			function(found) {
				if (found.elmType == "panel" &&
					found != obj &&
					(found.edges[isOpposite ? opposite : dir] == oldEdges[dir]) && !!newEdges[dir]) {
					var e = found;
					var size = canvasState.getDimension(dir);
					e.edges[isOpposite ? opposite : dir] = newEdges[dir];
					e[isOpposite ? opposite : dir] = newEdges[dir] + canvasState.getPanelMargin();
					if (dir == "bottom" || dir == "right") {
						e[size] = e.edges[dir] - e.edges[opposite] - 2 * canvasState.getPanelMargin();
					} else {
						e[size] = e.edges[opposite] - e.edges[dir] - 2 * canvasState.getPanelMargin();
					}
					found.setCoords();
				}
	    }
	  );
	};

	var resizePanels = function(obj, newEdges) {
		for (var n in newEdges) {
			if (canvasState.contains(n, newEdges[n])) {
				resizeOneDirection(n, obj, newEdges, true);
				resizeOneDirection(n, obj, newEdges, false);
			}
		}
	};

	/* activate returns this (the tool) */
	var activate = function() {
		//console.log("select activated");
		canvas.selection = true; // enable group selection

		canvasState.mapElements(
			function(found) { // map
				if (found.elmType == "panel") {
					found.set({
						selectable: true,
						lockScalingX: false,
						lockScalingY: false
					});
				}
			}
		);

		canvas.on('object:moving', function(options) {
		  if (canvasState.snapToGridEnabled() && options.target.type != "panel") {
		    var gridSpacing = canvasState.getGridSpacing();
		    var snapTolerance = canvasState.getSnapDistance();
        var edges = [
          new Snap.edge(getDist(getLeft(options)), function(opt) {
              setLeft(opt, snap(getLeft(opt)));
          }),
          new Snap.edge(getDist(getRight(options)), function(opt) {
              setRight(opt, snap(getRight(opt)));
          }),
          new Snap.edge(getDist(getTop(options)), function(opt) {
              setTop(opt, snap(getTop(opt)));
          }),
          new Snap.edge(getDist(getBottom(options)), function(opt) {
              setBottom(opt, snap(getBottom(opt)));
          }),
        ];

        edges.sort(function(a, b) {return a.dist - b.dist});
        edges[0].snap(options);
        edges[1].snap(options);

        for (var i = 2; i < edges.length; i++) {
          dif = edges[i].dist - edges[i-1].dist;
          if (dif < 0.5) {
            edges[i].snap(options);
          }
        }
      }
		});

		canvas.on('object:scaling', function(options) {
      var gridSpacing = canvasState.getGridSpacing();
      var snapTolerance = canvasState.getSnapDistance();
      var snapToGrid = canvasState.snapToGridEnabled();
      var panelMargin = canvasState.getPanelMargin();

			options.target.width *= options.target.scaleX;
			options.target.scaleX = 1;
			options.target.height *= options.target.scaleY;
			options.target.scaleY = 1;
			if (options.target.type == "panel") {
				var corner = options.target.__corner;
				var obj = options.target;
				var newEdges = {};
				if (snapToGrid) {
				  console.log("scaling panel with snap");
          if (corner.indexOf('l') >= 0) {
            newEdges.left = snap(obj.left - panelMargin);
            obj.left = newEdges.left + panelMargin;
            obj.width = obj.edges.right - obj.left - panelMargin;
          }
          if (corner.indexOf('t') >= 0) {
            newEdges.top = snap(obj.top - panelMargin);
            obj.top = newEdges.top + panelMargin;
            obj.height = obj.edges.bottom - obj.top - panelMargin;
          }
          if (corner.indexOf('r') >= 0) {
            newEdges.right = snap(obj.width + obj.left + panelMargin);
            obj.width = newEdges.right - obj.left - panelMargin;
          }
          if (corner.indexOf('b') >= 0) {
            newEdges.bottom = snap(obj.height + obj.top + panelMargin);
            obj.height = newEdges.bottom - obj.top - panelMargin;
          }
          console.log(newEdges);
				} else {
          if (corner.indexOf('l') >= 0) {
            newEdges.left = obj.left - panelMargin;
          }
          if (corner.indexOf('t') >= 0) {
            newEdges.top = obj.top - panelMargin;
          }
          if (corner.indexOf('r') >= 0) {
            newEdges.right = obj.width + obj.left + panelMargin;
          }
          if (corner.indexOf('b') >= 0) {
            newEdges.bottom = obj.height + obj.top + panelMargin;
          }
				}
				resizePanels(obj, newEdges);
				obj.edges = {
					left: newEdges.left || obj.edges.left,
					top: newEdges.top || obj.edges.top,
					right: newEdges.right || obj.edges.right,
					bottom: newEdges.bottom || obj.edges.bottom,
				};
//				obj.scaleX = 1;
//				obj.scaleY = 1;
			}
		});

		canvas.on('object:selected', function(options) {
			if (options.elmType !== 'text') {
				var obj = options.target;
				// obj.onKeyPress(e);
			}
		});
		return this;
	};

	var deactivate = function() {
		console.log("select deactivated");
		canvas.selection = false; // disable group selection
		canvas.deactivateAll();
		canvasState.mapElements(
			function(found) { // map
				found.set({
					selectable: false
				});
			}
		);
		canvas.__eventListeners["object:scaling"] = [];
	};

	return {
		name: "Select",
		init: function() {
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};
});