define(["../../CanvasState", "../SnapUtil"], function(canvasState, snap) {

	var canvas;
	var snapPoint;

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

		snapPoint = snap.snapPoint;

		console.log("select activated");

		canvas.selection = true; // enable group selection

		var selectable = {
			"panel": {
				selectable: false
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