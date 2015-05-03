//TODO check bug where sometimes text isn't editable (possibly b/c of above/below layers)

define(["../../CanvasState"], function(canvasState) {

	var fontFamily;
	var fontSize;
	var padding = 3;

	fabric.Rectext = fabric.util.createClass(fabric.IText, {

		type: "rectext",

		initialize: function(text, options) {
			options || (options = {});

			this.callSuper('initialize', text, options);
			this.set({
				elmType: "rectext",
				transparentCorners: true,
				lockRotation: true,
				hasRotatingPoint: false,
				backgroundColor: "rgba(0, 0, 0, 0)"
			});

			this.setControlsVisibility({
				mt: false,
				mb: false,
				mr: false,
				ml: false
			})

			this.border = new fabric.Rect({
				left: options.left - options.padding,
				top: options.top - options.padding,
				width: options.width + (options.padding * options.scaleX * 2),
				height: options.height + (options.padding * options.scaleY * 2),
				fill: "rgba(0, 0, 0, 0)", // transparent
				stroke: "black",
				strokeWeight: 2,
				hasRotatingPoint: false,
				textbox: this,
				helper: true
			});

			canvasState.addElement(this.border, "textBorder");
		},


		toObject: function() {
			return fabric.util.object.extend(this.callSuper('toObject'), {
				border: this.border.toObject(),
				elmType: "rectext"
			});
		},

		_render: function(ctx) {
			this.callSuper('_render', ctx);
		}
	});

	/*
	 * Async loaded object
	 */
	fabric.Rectext.fromObject = function(object, callback) {
		fabric.util.enlivenObjects(object.objects, function(enlivenedObjects) {
			delete object.objects;
			callback && callback(new fabric.Rectext(enlivenedObjects, object));
		});
	};
	fabric.Rectext.async = true;

	var adjustBorder = function(obj) {
		obj.border.set({
			width: (obj.width * obj.scaleX) + (2 * obj.padding),
			height: (obj.height * obj.scaleY) + (2 * obj.padding),
			left: obj.left - obj.padding,
			top: obj.top - obj.padding,
			scaleX: 1,
			scaleY: 1
		});

		canvas.renderAll();
	}

	var activate = function() {
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

		var finalPos;
		var selected;
		var time;

		canvas.on('mouse:down', function(coor) {
			selected = coor.target;

			if (selected) {
				/*				if(coor.target.elmType === "textBorder") {
									console.log("HREJKLRJE:KLFDS");
									console.log("to obj", coor.target.toObject);
									console.log("obj", coor.target);

									var newText = coor.target.textbox;
								    canvas.setActiveObject(newText);
								    newText.selectAll();
								    newText.enterEditing();
								    newText.hiddenTextarea.focus();
								}*/
			}

		}); // mouse:down

		canvas.on('mouse:up', function(coor) {
			finalPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			};

			if (typeof selected == "undefined" || (selected.elmType != "rectext" && selected.elmType != "textBorder")) {
				if (typeof selected != "undefined" && (selected.elmType != "rectext" && selected.elmType != "textBorder") &&
					typeof time != "undefined" && Math.abs(time - coor.e.timeStamp) < 250) {
					var newText = new fabric.Rectext('Text', {
						fontFamily: $('#font-family :selected').val(),
						fontSize: 12,
						fill: $("#font-color").val(),
						left: finalPos.x,
						top: finalPos.y,
						padding: 3,
						width: 5,
						height: 5,
						scaleX: 1,
						scaleY: 1
					});

					canvasState.addElement(newText, 'rectext');
					adjustBorder(newText);
					console.log("to object", newText.toObject());
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
				adjustBorder(selected);
			}
		});

		canvas.on("text:changed", function(e) {
			adjustBorder(selected);
			canvas.trigger("change");
		});

		canvas.on("object:moving", function(e) {
			var selected = e.target;
			if (selected.elmType == "rectext") {
				adjustBorder(selected);
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
	};


	return {
		name: "Text",
		activate: activate,
		deactivate: deactivate,
		set: function (property, value) {
			if (property == "fontFamily") {
				fontFamily = value;
			}
		}
	};

});