//TODO: fix bug with resizing panels outside of valid page area

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
					found.setCoords();
				}
			}
		);
	};

	var checkOneDirection = function(dir, obj, newEdges, isOpposite) {
		var opposite = canvasState.getOppositeDirection(dir); // ex. if dir is left, opposite is right
		var oldEdges = obj.edges;
		canvasState.mapElements(
			function(found) {
				if (found.elmType == "panel" &&
					found != obj &&
					(found.edges[isOpposite ? opposite : dir] == oldEdges[dir]) && !!newEdges[dir]) {
					var e = found;
					var size = canvasState.getDimension(dir); // either "width" or "height"
					tmpEdge = newEdges[dir];
					if (isOpposite) {
						if (Math.abs(newEdges[dir] - found.edges[dir]) < minDim) {
							return false;
						}
					} else {
						if (Math.abs(newEdges[dir] - found.edges[opposite]) < minDim) {
							return false;
						}
					}
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

	// Checks if resizing a panel is a valid operation
	var checkPanels = function(obj, newEdges) {
		var resizeOK = true;
		for (var n in newEdges) {
			if (canvasState.contains(n, newEdges[n])) {
				resizeOK = resizeOK &&
					resizeOneDirection(n, obj, newEdges, true) &&
					resizeOneDirection(n, obj, newEdges, false);
			}
		}
		return resizeOK;
	};

	/* activate returns this (the tool) */
	var activate = function() {
		canvas = canvasState.getCanvas();
		canvas.on("mouse:down", function(options) {
			canvasState.setActiveObj(options.target);

			if(options.target.elmType === "rectext") {
				// testing
				var reformat = JSON.stringify(options.target);
				console.log("original", reformat);

				reformat = reformat.replace(/(?:\\n)/g, '\\\n');
				//var here = reformat.replace("\\n", "BYYYEE");
				console.log("reformated", reformat);


				// end texting
			}

		});

		console.log(canvasState);
		snapPoint = snap.snapPoint;
		minDim = canvasState.getPanelMargin() * 3;

		console.log("select activated");

		canvas.selection = true; // enable group selection

		var selectable = {
			"panel": {
				selectable: true,
				lockScalingX: false,
				lockScalingY: false
			},
			"rectext": {
				selectable: true,
				editable: false
			},
			"path": {
				selectable: true,
				hasRotatingPoint : false
			},
			"image": {
				selectable: true
			},
			"circle": {
				selectable: true
			}

		}

		canvasState.mapElements(function(found) { // map
			console.log(found);
			var options = {};
			if (selectable.hasOwnProperty(found.elmType)) {
				options = selectable[found.elmType];
				// console.log(options);
			} else if (selectable.hasOwnProperty(found.type)) { // just for paths
				options = selectable[found.type];
				if(found.type === "path") {
					found.setControlsVisibility({
						mt: false,
						mb: false,
						ml: false,
						mr: false
					});
				}
			} else {
				console.log("unexpected type: " + found.elmType);
				found.set({
					selectable: false
				});
			}

			for (property in options) {
				found.set(property, options[property]);
			}
		});

		canvas.on('object:moving', function(options) {
			target = options.target;
			if (snap.isSnapActive() && options.target.elmType != "panel") {
				target = options.target;
				var borders = snap.snapBorders({
					left: target.left,
					right: target.left + target.width,
					top: target.top,
					bottom: target.top + target.height,
				});

				for (b in borders) {
					if (typeof borders[b] != "undefined") {
						if (b in target) {
							target[b] = borders[b];
						} else {
							var dim = canvasState.getDimension(b);
							var opposite = canvasState.getOppositeDirection(b);
							target[opposite] = borders[b] - target[dim];
						}
					}
				}
			} else if (target.elmType === "rectext") {
				canvasState.adjustBorder(target);
				console.log("adjusting pos text");
			}
		});

		canvas.on('object:scaling', function(options) {
			target = options.target;
			if (target.elmType == "rectext") {
				canvasState.adjustBorder(target);
			}

			if (target.elmType == "panel") {
				var panelMargin = canvasState.getPanelMargin();

				if (!target.active) {
					target.scaleX = 1;
					target.scaleY = 1;
					target.left = target.edges.left + panelMargin;
					target.top = target.edges.top + panelMargin;
					return;
				}
				if (!(options.target.left + 1 * panelMargin < options.target.left + options.target.scaleX * options.target.width)) {
					options.target.scaleX = 1;
					canvas.deactivateAll().renderAll();
					return;
				}
				if (!(options.target.top + 1 * panelMargin < options.target.top + options.target.scaleY * options.target.height)) {
					options.target.scaleY = 1;
					canvas.deactivateAll().renderAll();
					return;
				}
				options.target.width *= options.target.scaleX;
				options.target.scaleX = 1;
				options.target.height *= options.target.scaleY;
				options.target.scaleY = 1;

				var corner = target.__corner;
				var obj = target;
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
//				if (!checkPanels(target, newEdges)) {
//					console.log("Do not resize.");
//				}
				resizePanels(obj, newEdges);
				obj.edges = {
					left: newEdges.left || obj.edges.left,
					top: newEdges.top || obj.edges.top,
					right: newEdges.right || obj.edges.right,
					bottom: newEdges.bottom || obj.edges.bottom,
				};
			} else {
				if (snap.isSnapActive()) {
					control = target.__corner;
					var borders = snap.snapBorders({
						left: target.left,
						right: target.left + target.width,
						top: target.top,
						bottom: target.top + target.height,
					}, control);
					for (b in borders) {
						if (typeof borders[b] != 'undefined' && (typeof control == 'undefined' || control.indexOf(b.charAt(0)) >= 0)) {
							var dim = canvasState.getDimension(b);
							var opposite = canvasState.getOppositeDirection(b);
							if (b in target) {
								target[dim] = target[b] + target[dim] - borders[b];
								target[b] = borders[b];
							} else {
								target[dim] = borders[b] - target[opposite];
								target[opposite] = borders[b] - target[dim];
							}
						}
					}
				}
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
				if (!found.active) {
					found.set({
						selectable: false
					});
				}
			}
		);

		canvas.off("object:scaling");
		canvas.off("object:moving");
		canvas.off("text:changed");
		canvas.off("mouse:down");
	};

	return {
		name: "Select",
		activate: activate,
		deactivate: deactivate
	};
});