//TODO make textbox fill width and height of border box
//TODO check bug where sometimes text isn't editable (possibly b/c of above/below layers)

define(["../../CanvasState"], function(canvasState) {

  var fontFamily;
  var fontSize;
  var padding = 3;

	var Rectext = fabric.util.createClass(fabric.IText, {

    type: "rectext",

	  initialize: function(text, options) {
	    options || (options = { });
	    options.selectable = false;
	    options.hasRotatingPoint = false;

	    this.callSuper('initialize', text, options);
	    this.transparentCorners = true;
	    this.lockRotation = true;
	    this.border = new fabric.Rect({
        left: options.left - padding,
        top: options.top - padding,
        width: options.width,
        height: options.height,
        fill: "rgba(0, 0, 0, 0)", // transparent
        stroke: "black",
        strokeWeight: 2,
        hasRotatingPoint: false,
      });
      this.border.textbox = this; // give textborder a reference back to text
      this.border.elmType = "textBorder";
      canvas.add(this.border);
      this.selectable = true;
	  },

	  remove: function() {
	    canvas.remove(this.border);
      canvasState.deleteElement(this);
	  },

	  adjustScale: function(x, y, l, t) {
	    this.width *= x;
	    this.height *= y;
	    this.left = l;
	    this.top = t;
	    this.scaleX = 1; // this keeps the font size the same (probably what we want?)
	    this.scaleY = 1;
	    this.border.set({
	      width: this.width + 2 * padding,
	      height: this.height + 2 * padding,
	      left: l - padding,
	      top: t - padding,
	      scaleX: 1,
	      scaleY: 1,
	    });
	  },

	  adjustPosition: function(l, t) {
	    this.border.set({
	      left: l - padding,
	      top: t - padding,
	    });
	    this.left = l;
	    this.top = t;
	  },

	  toObject: function() {
	    return fabric.util.object.extend(this.callSuper('toObject'), {
	      //label: this.get('label')
	    });
	  },

	  _render: function(ctx) {
	    this.callSuper('_render', ctx);
	  }
	});

	var Roundtext = fabric.util.createClass(fabric.IText, {

	});


	var activate = function() {
		console.log("text activate");

		// nothing should be moving
		canvasState.mapElements(
			function(found) { // map
				if (found.type === "rectext") {
					found.set({
						selectable: true
					});
				} else {
					found.set({
						selectable: false
					});
				}
			}
		);

		var initialPos;
		var finalPos;
		var selected;
		var time;

		canvas.on('mouse:down', function(coor) {
			initialPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			};
		}); // mouse:down

		canvas.on('mouse:up', function(coor){
			finalPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			};
			selected = coor.target;

			if(typeof selected == "undefined" || (selected.elmType != "rectext" && selected.elmType != "textBorder")) {
					if (Math.abs(initialPos.x - finalPos.x) > 50 && Math.abs(initialPos.y - finalPos.y) > 20) {
						var test = new Rectext('Text', {
							fontFamily: $('#font-family :selected').val(),
							fontSize: $('#font-size')[0].value,
							fill: $("#font-color").val(),
							backgroundColor: 'white',
							left: initialPos.x,
							top: initialPos.y,
							width: finalPos.x - initialPos.x,
							height: finalPos.y - initialPos.y,
						});
						canvasState.addElement(test, 'rectext');

					} else if (typeof selected != "undefined" && (selected.elmType != "rectext" && selected.elmType != "textBorder") &&
					    typeof time != "undefined" && Math.abs(time - coor.e.timeStamp) < 250) {
            var test = new Rectext('Text', {
              fontFamily: $('#font-family :selected').val(),
              fontSize: $('#font-size')[0].value,
              left: initialPos.x,
              top: initialPos.y,
              width:40,
              height:20,
            });

            canvasState.addElement(test, 'rectext');
          }
          time = coor.e.timeStamp;
			}
		}); // mouseup

		canvas.on("object:scaling", function(e) {
		  var selected = e.target;
		  if (selected.elmType == "rectext") {
		    selected.adjustScale(selected.scaleX, selected.scaleY, selected.left, selected.top);
		  } else if (selected.elmType == "textBorder") {
		    selected.textbox.adjustScale(selected.scaleX, selected.scaleY, selected.left + padding, selected.top + padding);
		  }
		});

		canvas.on("object:moving", function(e) {
		  var selected = e.target;
		  if (selected.elmType == "rectext") {
		    selected.adjustPosition(selected.left, selected.top);
		  } else if (selected.elmType == "textBorder") {
		    selected.textbox.adjustPosition(selected.left + padding, selected.top + padding);
		  }
		});

		document.onkeydown = function(e) {
			var key = e.keyCode;
			if (key === 8 && selected.elmType == 'rectext') {
				selected.remove();
			} else if (key === 8 && selected.elmType == 'textBorder') {
				selected.textbox.remove();
			}
		};

		return this;
	};

	var deactivate = function() {
		console.log("text deactivate");
		canvas.__eventListeners["mouse:up"] = [];
		canvas.__eventListeners["mouse:down"] = [];
	};


	return {
		name: "Text",
		init: function() {
			console.log("init text");
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate
	};

});