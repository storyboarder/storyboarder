define(["../../CanvasState", "../SnapUtil"], function(canvasState, snap) {

	var canvas;
	var snapPoint;
	var minDim;

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
					e.setCoords();
				}
			}
		);
	};

	var checkOneDirection = function(dir, obj, newEdges, isOpposite) {
		var opposite = canvasState.getOppositeDirection(dir); // ex. if dir is left, opposite is right
		var oldEdges = obj.edges;
		var checkOK = true;
		canvasState.mapElements(
			function(found) {
				if (found.elmType == "panel" &&
					found != obj &&
					(found.edges[isOpposite ? opposite : dir] == oldEdges[dir]) && !!newEdges[dir]) {
					var e = found;
					var size = canvasState.getDimension(dir); // either "width" or "height"
					tmpEdge = newEdges[dir];
					if (isOpposite && Math.abs(newEdges[dir] - found.edges[dir]) < minDim) {
						checkOK = false;
					} else if (!isOpposite && Math.abs(newEdges[dir] - found.edges[opposite]) < minDim) {
						checkOK = false;
					}
				}
			}
		);
		return checkOK;
	};

	var resizePanels = function(obj, newEdges) {
		for (var n in newEdges) {
			if (canvasState.contains(n, newEdges[n])) {
				resizeOneDirection(n, obj, newEdges, true);
				resizeOneDirection(n, obj, newEdges, false);
			}
		}
	};

	// Checks if resizing a panel is a valid operation
	var checkPanels = function(obj, newEdges) {
		var resizeOK = true;
		for (var n in newEdges) {
			if (canvasState.contains(n, newEdges[n])) {
				if (!checkOneDirection(n, obj, newEdges, true) ||
					!checkOneDirection(n, obj, newEdges, false)) {
					return false;
				}
			}
		}
		return true;
	};

	var checkCurrentPanel = function(obj) {
		panelMargin = canvasState.getPanelMargin();
		if (!obj.active) {
			obj.scaleX = 1;
			obj.scaleY = 1;
			obj.left = obj.edges.left + panelMargin;
			obj.top = obj.edges.top + panelMargin;
			return false;
		}
		if (!(obj.left + minDim < obj.left + obj.scaleX * obj.width)) {
			obj.scaleX = 1;
			return false;
		}
		if (!(obj.top + minDim < obj.top + obj.scaleY * obj.height)) {
			obj.scaleY = 1;
			return false;
		}
		return true;
  }

	/* activate returns this (the tool) */
	var activate = function() {
		// console.log("panelselect");
		canvas = canvasState.getCanvas();
		canvas.on("mouse:down", function(options) {
			canvasState.setActiveObj(options.target);

		});

		snapPoint = snap.snapPoint;
		minDim = canvasState.getPanelMargin() * 4;

		canvas.selection = true; // enable group selection

		canvasState.mapElements(function(found) { // map
			if (found.elmType == "panel") {
				// console.log(found);
				found.set({
					selectable: true,
					lockScalingX: false,
					lockScalingY: false,
				});
			} else {
				found.set({selectable: false});
			}
		});

		canvas.on('object:moving', function(options) {
			obj = options.target;
			if (snap.isSnapActive() && options.obj.elmType != "panel") {
				var borders = snap.snapBorders({
					left: obj.left,
					right: obj.left + obj.width,
					top: obj.top,
					bottom: obj.top + obj.height,
				});

				for (b in borders) {
					if (typeof borders[b] != "undefined") {
						if (b in obj) {
							obj[b] = borders[b];
						} else {
							var dim = canvasState.getDimension(b);
							var opposite = canvasState.getOppositeDirection(b);
							obj[opposite] = borders[b] - obj[dim];
						}
					}
				}
			}
		});

		canvas.on('object:scaling', function(options) {
			obj = options.target;
			if (obj.elmType != "panel") {
				throw "Unexpected element: " + obj.elmType;
			}

			var panelMargin = canvasState.getPanelMargin();

			if (!checkCurrentPanel(obj)) {
				canvas.deactivateAll().renderAll();
				return;
			}
			obj.width *= obj.scaleX;
			obj.scaleX = 1;
			obj.height *= obj.scaleY;
			obj.scaleY = 1;

			var corner = obj.__corner;
			var newEdges = {};
			if (snap.isSnapActive()) {
				if (corner.indexOf('l') >= 0) {
					newEdges.left = snap.snapPoint({
						x: obj.left - panelMargin
					}).x;
					obj.left = newEdges.left + panelMargin;
					obj.width = obj.edges.right - obj.left - panelMargin;
				}
				if (corner.indexOf('t') >= 0) {
					newEdges.top = snap.snapPoint({
						y: obj.top - panelMargin
					}).y;
					obj.top = newEdges.top + panelMargin;
					obj.height = obj.edges.bottom - obj.top - panelMargin;
				}
				if (corner.indexOf('r') >= 0) {
					newEdges.right = snap.snapPoint({
						x: obj.width + obj.left + panelMargin
					}).x;
					obj.width = newEdges.right - obj.left - panelMargin;
				}
				if (corner.indexOf('b') >= 0) {
					newEdges.bottom = snap.snapPoint({
						y: obj.height + obj.top + panelMargin
					}).y;
					obj.height = newEdges.bottom - obj.top - panelMargin;
				}
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
			if (!checkPanels(obj, newEdges)) {
				canvas.deactivateAll();
				return;
			}
			resizePanels(obj, newEdges);
			canvas.renderAll();
			obj.edges = {
				left: newEdges.left || obj.edges.left,
				top: newEdges.top || obj.edges.top,
				right: newEdges.right || obj.edges.right,
				bottom: newEdges.bottom || obj.edges.bottom,
			};
		});

		return this;
	};

	var deactivate = function() {
		// console.log("select deactivated");
		canvas.selection = false; // disable group selection
		canvas.deactivateAll();
		canvasState.mapElements(
			function(found) { // map
				if (!found.active) {
					found.set({
						selectable: false
					});
				}
			}
		);

		canvas.off("object:scaling");
		canvas.off("object:moving");
		canvas.off("mouse:down");
	};

	return {
		name: "PanelSelect",
		activate: activate,
		deactivate: deactivate
	};
});