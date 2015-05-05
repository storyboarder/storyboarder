//TODO check bug where sometimes text isn't editable (possibly b/c of above/below layers)

define(["../../CanvasState"], function(canvasState) {
	var fontFamily;
	var fill;
	var canvas;

	var activate = function() {
		var finalPos;
		var selected;
		var time;

		console.log("text activate");
		canvas = canvasState.getCanvas();

		// nothing should be moving
		canvasState.mapElements(
			function(found) {
				if (found.elmType === "rectext") {
					found.set({
						selectable: true,
						editable: true
					});

				} else {
					found.set({
						selectable: false
					});
				}
			}
		);

		canvas.on('mouse:down', function(coor) {
			console.log("mouse down");
			selected = coor.target;
		}); // mouse:down

		canvas.on('mouse:up', function(coor) {
			finalPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			};

			if (typeof selected == "undefined" || (selected.elmType != "rectext" && selected.elmType != "textBorder")) {
				if (typeof selected != "undefined" && (selected.elmType != "rectext" && selected.elmType != "textBorder") &&
					typeof time != "undefined" && Math.abs(time - coor.e.timeStamp) < 250) {

					var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
					var id = randLetter + Date.now();

					var newText = new fabric.IText('Text', {
						fontFamily: fontFamily,
						fontSize: 12,
						fill: fill,
						left: finalPos.x,
						top: finalPos.y,
						padding: 3,
						width: 5,
						height: 5,
						id: id,
						transparentCorners: true,
						lockRotation: true,
						hasRotatingPoint: false
					});

					newText.setControlsVisibility({
						mt: false,
						mb: false,
						mr: false,
						ml: false
					});

					var newBorder = new fabric.Rect({
						left: newText.left - newText.padding,
						top: newText.top - newText.padding,
						width: newText.width + (newText.padding * newText.scaleX * 2),
						height: newText.height + (newText.padding * newText.scaleY * 2),
						fill: "rgba(0, 0, 0, 0)", // transparent
						stroke: "black",
						strokeWeight: 2,
						hasRotatingPoint: false,
						id: id,
						hasControls: false,
						selectable: false
					});


					canvasState.addElement(newBorder, "textBorder");
					canvasState.addElement(newText, 'rectext');
					canvasState.adjustBorder(newText);

					canvas.trigger("change");
				}

				time = coor.e.timeStamp;
			}

		}); // mouseup

		canvas.on("object:modified", function(e) {
			canvas.trigger("change");
		});

		canvas.on("object:scaling", function(e) {
			var selected = e.target;
			if (selected.elmType === "rectext") {
				canvasState.adjustBorder(selected);
			}
		});

		canvas.on("text:changed", function(e) {
			canvasState.adjustBorder(selected);
		});

		canvas.on("text:editing:entered", function() {
			canvasState.turnOffKeyListener();
		});

		canvas.on("text:editing:exited", function(e) {
			canvasState.turnOnKeyListener();
			canvas.trigger("change");
		});

		canvas.on("object:moving", function(e) {
			var selected = e.target;
			if (selected.elmType == "rectext") {
				canvasState.adjustBorder(selected);
			}
		});

		return this;
	};

	var deactivate = function() {
		console.log("text deactivate");
		canvas.off("mouse:up");
		canvas.off("mouse:down");
		canvas.off("object:moving");
		canvas.off("object:scaling");
		canvas.off("text:changed");
		canvas.off("text:editing:exited");
	};

	var change = function(property, value) {
		var canvas = canvasState.getCanvas();
		var active = canvas.getActiveObject();

		if (property === "fill") {
			fill = value;
		} else if (property === "fontFamily") {
			fontFamily = value;
		}

		if (active && active.elmType === "rectext") {
			active[property] = value;
			canvas.renderAll();
			canvasState.adjustBorder(active);
			// color creates too many changes, maybe just not have this triggered
			// canvas.trigger("change");
		}

	};

	return {
		name: "Text",
		activate: activate,
		deactivate: deactivate,
		set: function(property, value) {
			change(property, value);
		}
	};

});