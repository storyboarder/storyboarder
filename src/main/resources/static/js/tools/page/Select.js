//TODO: fix bug with resizing panels outside of valid page area

define(["../../CanvasState"], function(canvasState) {

	var canvas;

	// var resizeSameDirection = function(dir, obj, newEdges) {
	// 	var opposite = canvasState.getOppositeDirection(dir);
	// 	var oldEdges = obj.edges;
	// 	canvasState.filterMapElements(
	// 		function(e) {
	// 			if (e.elmType == "panel") {
	// 				return ((e.element.edges[dir] == oldEdges[dir]) && !!newEdges[dir]);
	// 			}
	// 		},
	// 		function(found) {
	// 			var e = found.element;
	// 			var size = canvasState.getDimension(dir);
	// 			e.edges[dir] = newEdges[dir];
	// 			e[dir] = newEdges[dir] + canvasState.getPanelMargin();	
	// 			if (dir == "bottom" || dir == "right") {
	// 				e[size] = e.edges[dir] - e.edges[opposite] - 2 * canvasState.getPanelMargin();
	// 			} else {
	// 				e[size] = e.edges[opposite] - e.edges[dir] - 2 * canvasState.getPanelMargin();
	// 			}
	// 		});

	// };

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
			});
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

		// for resizing and snap to grid functionality
		canvas.on('object:scaling', function(options) {

			options.target.width *= options.target.scaleX;
			options.target.scaleX = 1;
			options.target.height *= options.target.scaleY;
			options.target.scaleY = 1;
			options.target.corners = {
				left: options.target.left - 5,
				right: options.target.left + options.target.width + 5,
				top: options.target.top - 5,
				bottom: options.target.top + options.target.height + 5
			};
			if (canvasState.getSnapToGrid()) {
				if (options.e.clientX < distanceToClosestX) {
					// snap or display snap line
				}

				if (options.e.clientY < distanceToClosestY) {
					// snap or display snap ine
				}
			} else {
				var corner = options.target.__corner;
				var obj = options.target;
				var newEdges = {};
				if (corner.indexOf('l') >= 0) {
					newEdges.left = obj.left - canvasState.getPanelMargin();
				}
				if (corner.indexOf('t') >= 0) {
					newEdges.top = obj.top - canvasState.getPanelMargin();
				}
				if (corner.indexOf('r') >= 0) {
					newEdges.right = obj.width + obj.left + canvasState.getPanelMargin();
				}
				if (corner.indexOf('b') >= 0) {
					newEdges.bottom = obj.height + obj.top + canvasState.getPanelMargin();
				}
				resizePanels(obj, newEdges);
				obj.edges = {
					left: newEdges.left || obj.edges.left,
					top: newEdges.top || obj.edges.top,
					right: newEdges.right || obj.edges.right,
					bottom: newEdges.bottom || obj.edges.bottom,
				};
				obj.scaleX = 1;
				obj.scaleY = 1;
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