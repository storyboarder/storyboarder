//TODO: fix bug with resizing panels outside of valid page area

define(["../../CanvasState", "../SnapUtil"], function(canvasState, snap) {

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


	var adjustBorder = function(obj) {
		console.log("THIS IS BEING CALLLEDDD");
		console.log("border", obj.toObject());
		console.log("border stuff", obj.border);
		/*
				var yes = canvas["getObjects()"][1];

				if(yes) {
					yes.set({
					left: obj.left + 20,
					top: obj.top + 20,
				});
				}*/


		obj.border.set({
			width: (obj.width * obj.scaleX) + (2 * obj.padding),
			height: (obj.height * obj.scaleY) + (2 * obj.padding),
			left: obj.left - obj.padding,
			top: obj.top - obj.padding,
			scaleX: 1,
			scaleY: 1
		});
		console.log("FINIHSED");
		canvas.renderAll();
	}

	/* activate returns this (the tool) */
	var activate = function() {
		canvas = canvasState.getCanvas();
		snapPoint = canvasState.snapPoint;

		console.log("select activated");
		//		console.log("SELECT", canvas);
		//		console.log(canvas.getObjects());
		//canvas.getObjects()[1].selectable = true;
		//		console.log("SELECT", canvas);
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
			"draw": {
				// there's no draw, gotta check if path or stroke something exists
				selectable: true
			},
			"image": {
				selectable: true
			}
		}

		canvasState.mapElements(function(found) { // map
//			console.log(found);

			if (selectable.hasOwnProperty(found.elmType)) {
				var options = selectable[found.elmType];
				for (property in options) {
					found.set(property, options[property]);
				}
			} else {
				console.log("unexpected type: " + found.elmType);
				found.set({
					selectable: false
				});
			}
		});

		canvas.on('object:moving', function(options) {
			target = options.target;
			if (snap.isSnapActive() && options.target.elmType != "panel") {
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
				adjustBorder(target);
				console.log("adjusting pos text");
			}
			/*else if (target.elmType === "textBorder") {
				console.log("adjusting pos border");
      	target.textbox.adjustPosition(target.left + target.padding, target.top + target.padding);
      }*/
		});

		canvas.on('object:scaling', function(options) {

			target = options.target;
			if (target.elmType == "rectext") {
				adjustBorder(target);
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


		document.onkeydown = function(e) { // remove elements when delete is pressed
			var key = e.keyCode;
			var selected = canvas.getActiveObject();
			if (key === 8 && selected) {
				if (selected.elmType === 'rectext' || selected.elmType === "image") {
					canvas.remove(selected);
				}
			}
		};

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
	};

	return {
		name: "Select",
		activate: activate,
		deactivate: deactivate
	};
});