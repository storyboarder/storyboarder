//TODO check bug where sometimes text isn't editable (possibly b/c of above/below layers)

define(["../../CanvasState"], function(canvasState) {

  var fontFamily;
  var fontSize;
  var padding = 3;

	var Rectext = fabric.util.createClass(fabric.IText, {

    type: "rectext",

	initialize: function(text, options) {
	    options || (options = { });
	    options.hasRotatingPoint = false;
	    options.backgroundColor = "rgba(0, 0, 0, 0)";
	    options.padding = padding;

	    this.callSuper('initialize', text, options);
	    this.transparentCorners = true;
	    this.lockRotation = true;
	    this.border = new fabric.Rect({
	        left: options.left - options.padding,
	        top: options.top - options.padding,
	        width: options.width,
	        height: options.height,
	        fill: "rgba(0, 0, 0, 0)", // transparent
	        stroke: "black",
	        strokeWeight: 2,
	        hasRotatingPoint: false,
	        textbox : this
	 	});

      this.border.elmType = "textBorder";
      canvas.add(this.border);
	  },

	  remove: function() {
	    canvas.remove(this.border);
			canvasState.deleteElement(this);
	  },

	  adjustScale: function(x, y, l, t) {
			this.width *= x;
			this.height *= y;
	   	this.scaleX = 1; // this keeps the font size the same (probably what we want?)
	   	this.scaleY = 1;
	    this.left = l;
	    this.top = t;
	    this.border.set({
	      width: this.width + 2 * this.padding,
	      height: this.height + 2 * this.padding,
	      left: l - this.padding,
	      top: t - this.padding,
	      scaleX: 1,
	      scaleY: 1
	    });
	  },
	  adjustBorder: function() {
	  	console.log("adjusting border");
		var width = this.width;
		var height = this.height;
		var bwidth = this.border.width;
		var bheight = this.border.height;

		if (width >= bwidth - padding) {
			this.border.width = width + 2 * padding;
		}

		if (height >= bheight - padding) {
			this.border.height = height + 2 * padding;
		}
		canvas.renderAll();
	  },

	  adjustPosition: function(l, t) {
	    this.border.set({
	      left: l - this.padding,
	      top: t - this.padding,
	    });
	    this.left = l;
	    this.top = t;
	  },

	  toObject: function() {
	    return fabric.util.object.extend(this.callSuper('toObject'), {
	      border : this.border,
	      elmType : "rectext"
	    });
	  },

	  _render: function(ctx) {
	    this.callSuper('_render', ctx);
	  }
	});

	/*var Roundtext = fabric.util.createClass(fabric.IText, {

		type: "roundtext",

		initialize: function(text, options) {
	    options || (options = { });
	    options.hasRotatingPoint = false;
	    options.backgroundColor = "rgba(0, 0, 0, 0)";
	    options.padding = 3;

	    this.callSuper('initialize', text, options);
	    this.transparentCorners = true;
	    this.lockRotation = true;
	    this.border = new fabric.Circle({
	    	radius: 100,
			fill: '#eef',
			scaleY: 0.5,
			originX: 'center',
			originY: 'center',
		    fill: "rgba(0, 0, 0, 0)", // transparent
		    stroke: "black",
		    strokeWeight: 2,
		    hasRotatingPoint: false,
		    text : this
	 	});

      this.border.textbox = this; // give textborder a reference back to text
      this.border.elmType = "textBorder";
      canvas.add(this.border);
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
	      width: this.width + 2 * this.padding,
	      height: this.height + 2 * this.padding,
	      left: l - this.padding,
	      top: t - this.padding,
	      scaleX: 1,
	      scaleY: 1
	    });
	  },
	  adjustBorder: function() {
	  	console.log("HERE");
		var width = this.width;
		var height = this.height;
		var bwidth = this.border.width;
		var bheight = this.border.height;

		if(width >= bwidth - 10) {
			console.log("entering width");
			this.border.width = width + 20;
		} 

		if(height >= bheight - 10) {
			console.log("entering height");
			this.border.height = height + 20;
		}
		canvas.renderAll();
	  },
	  adjustPosition: function(l, t) {
	    this.border.set({
	      left: l - this.padding,
	      top: t - this.padding,
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
*/

	var activate = function() {
		console.log("text activate");

		// nothing should be moving
		canvasState.mapElements(
			function(found) {
				if (found.elmType === "textBorder" || found.elmType === "rectext") { // found.elmType === "rectext" || 
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

		var finalPos;
		var selected;
		var time;

		canvas.on('mouse:down', function(coor) {
			selected = coor.target;
			console.log("LOOK HEREEEEEE", selected.toObject());

			if(selected) {
				if(coor.target.elmType === "textBorder") {
					var newText = coor.target.textbox;
				    canvas.setActiveObject(newText);
				    newText.selectAll();
				    newText.enterEditing();
				    newText.hiddenTextarea.focus();
				}
			}

		}); // mouse:down

		canvas.on('mouse:up', function(coor){
			finalPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			};

			if(typeof selected == "undefined" || (selected.elmType != "rectext" && selected.elmType != "textBorder")) {
				if (typeof selected != "undefined" && (selected.elmType != "rectext" && selected.elmType != "textBorder") &&
				    typeof time != "undefined" && Math.abs(time - coor.e.timeStamp) < 250) {
		            var test = new Rectext('Text', {
		              fontFamily: $('#font-family :selected').val(),
		              fontSize: $('#font-size')[0].value,
		              fill: $("#font-color").val(),
		              left: finalPos.x,
		              top: finalPos.y,
		              width: 5,
		              height: 5
		            });

		            canvasState.addElement(test, 'rectext');
		            test.adjustBorder();
	          	}

          		time = coor.e.timeStamp;
			}
		}); // mouseup

		canvas.on("object:scaling", function(e) {
		  var selected = e.target;
		  if (selected.elmType == "rectext") {
		    selected.adjustScale(selected.scaleX, selected.scaleY, selected.left, selected.top);
		  } else if (selected.elmType == "textBorder") {
		    selected.textbox.adjustScale(selected.scaleX, selected.scaleY, selected.left + selected.padding, selected.top + selected.padding);
		  }
		  console.log(selected);
		});

		canvas.on("object:moving", function(e) {
		  var selected = e.target;
		  if (selected.elmType == "rectext") {
		    selected.adjustPosition(selected.left, selected.top);
		  } else if (selected.elmType == "textBorder") {
		    selected.textbox.adjustPosition(selected.left + selected.padding, selected.top + selected.padding);
		  }
		});

		canvas.on("text:changed", function(e) {
			e.target.adjustBorder();
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
		canvas.__eventListeners["object:moving"] = [];
		canvas.__eventListeners["object:scaling"] = [];
		canvas.__eventListeners["text:changed"] = [];
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