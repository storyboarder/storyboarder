
//TODO: fix bug with resizing panels outside of valid page area

define(["../../CanvasState", "../../SnapUtil"], function(canvasState, Snap) {

	var canvas;
	var snapPoint;

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
			  console.log(found.elmType);
				if (found.elmType === "panel") {
					found.set({
						selectable: true,
						lockScalingX: false,
						lockScalingY: false
					});
				} else if(found.elmType === "rectext" || found.elmType === "textBorder") {
					found.set({
						selectable: true
					});
				} else if(found.elmType === "path") {
					found.set({
						selectable: true
					})
				}
			}
		);

		canvas.on('object:moving', function(options) {
			target = options.target;
		  if (canvasState.isSnapActive() && options.target.elmType != "panel") {
		    target = options.target;
		    var borders = canvasState.snapBorders({
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
      	target.adjustPosition(target.left, target.top);
				console.log("adjusting pos text");
      } else if (target.elmType === "textBorder") {
				console.log("adjusting pos border");
      	target.textbox.adjustPosition(target.left + target.padding, target.top + target.padding);
      }
		});

		canvas.on('object:scaling', function(options) {

			target = options.target;
			if (target.elmType == "rectext") {
				target.adjustScale(target.scaleX, target.scaleY, target.left, target.top);
			} else if (target.elmType == "textBorder") {
				target.textbox.adjustScale(target.scaleX, target.scaleY, target.left + target.padding, target.top + target.padding);
			}

			if (options.target.elmType == "panel") {
				var panelMargin = canvasState.getPanelMargin();
				options.target.width *= options.target.scaleX;
				options.target.scaleX = 1;
				options.target.height *= options.target.scaleY;
				options.target.scaleY = 1;

				console.log("panel");
				var corner = options.target.__corner;
				var obj = options.target;
				var newEdges = {};
				if (canvasState.isSnapActive()) {
					console.log("scaling panel with snap");
					if (corner.indexOf('l') >= 0) {
						newEdges.left = snapPoint({
							x: obj.left - panelMargin
						}).x;
						obj.left = newEdges.left + panelMargin;
						obj.width = obj.edges.right - obj.left - panelMargin;
					}
					if (corner.indexOf('t') >= 0) {
						newEdges.top = snapPoint({
							y: obj.top - panelMargin
						}).y;
						obj.top = newEdges.top + panelMargin;
						obj.height = obj.edges.bottom - obj.top - panelMargin;
					}
					if (corner.indexOf('r') >= 0) {
						newEdges.right = snapPoint({
							x: obj.width + obj.left + panelMargin
						}).x;
						obj.width = newEdges.right - obj.left - panelMargin;
					}
					if (corner.indexOf('b') >= 0) {
						newEdges.bottom = snapPoint({
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
				resizePanels(obj, newEdges);
				obj.edges = {
					left: newEdges.left || obj.edges.left,
					top: newEdges.top || obj.edges.top,
					right: newEdges.right || obj.edges.right,
					bottom: newEdges.bottom || obj.edges.bottom,
				};
			} else {
				if (canvasState.isSnapActive()) {
					target = options.target;
					control = target.__corner;
					var borders = canvasState.snapBorders({
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

		canvas.on('object:selected', function(options) {
			if (options.elmType !== 'text') {
				var obj = options.target;
				// obj.onKeyPress(e);
			}
		});


		canvas.on("text:changed", function(e) {
			e.target.adjustBorder();
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
		if (typeof canvas.__eventListeners != "undefined") {
		  canvas.__eventListeners["object:scaling"] = [];
		  canvas.__eventListeners["object:moving"] = [];
		  canvas.__eventListeners["object:selected"] = [];
		  canvas.__eventListeners["text:changed"] = [];
    }
	};

	return {
		name: "Select",
		init: function() {
			canvas = canvasState.getCanvas();
			snapPoint = canvasState.snapPoint;
		},
		activate: activate,
		deactivate: deactivate
	};
});