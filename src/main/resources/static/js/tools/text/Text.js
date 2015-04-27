define(["../../CanvasState"], function(canvasState) {


	var Rectext = fabric.util.createClass(fabric.IText, {

	  type: 'rectext',

	  initialize: function(text, options) {
	    options || (options = { });
	    this.callSuper('initialize', text, options);
	    this.borderColor = "black";
	    this.transparentCorners = true;
	    this.lockRotation = true;
	  },

	  toObject: function() {
	    return fabric.util.object.extend(this.callSuper('toObject'), {
	      //label: this.get('label')
	    });
	  },

	  _render: function(ctx) {
	    this.callSuper('_render', ctx);
	    this.drawBorders(ctx);
	  }
	});

	var Roundtext = fabric.util.createClass(fabric.Circle, {

	  type: 'roundtext',

	  initialize: function(text, options) {
	    options || (options = { });

	    this.callSuper('initialize', text, options);
	  },

	  toObject: function() {
	    return fabric.util.object.extend(this.callSuper('toObject'), {
	      //label: this.get('label')
	    });
	  },

	  _render: function(ctx) {
	    this.callSuper('_render', ctx);

	    ctx.font = '20px Helvetica';
	    ctx.fillStyle = '#333';
	    ctx.fillText(this.label, -this.width/2, -this.height/2 + 20);
	  }
	});


	var activate = function() {

		// nothing should be moving
		canvasState.mapElements(
			function(found) { // map
				if (found.type === "text") {
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

		console.log("text activate"); 
		var initialPos;
		var finalPos;
		var selected;

		canvas.on('mouse:down', function(coor) {

			initialPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			}

			selected = coor.target;
		});

		canvas.on('mouse:up', function(coor) {

			finalPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			}

			if(selected && selected.type !== "rectext") {

				if (Math.abs(initialPos.x - finalPos.x) > 50 && Math.abs(initialPos.y - finalPos.y) > 20) {
					width = Math.abs(initialPos.x - finalPos.x);
					height = Math.abs(initialPos.y - finalPos.y);

					var test = new Rectext('Text', {
						fontFamily: 'arial black',
						fontSize: 14,
						left: initialPos.x,
						top: initialPos.y
					});

					canvasState.addElement(test, 'rectext');
					console.log(test.type);

				} // if within range
			}
		}); // mouseup

		document.onkeydown = function(e) {
			console.log("pressed");
			var key = e.keyCode;
			console.log(key);
			console.log(selected.type);
			if (key === 8 && selected.type === 'rectext') {
				console.log("delete");
				console.log(selected.type);
				canvasState.deleteElement(selected);
			}
		};

		return this;
	};

	var deactivate = function() {
		console.log("text deactivate");
		canvas.__eventListeners["mouse:up"] = [];
		canvas.__eventListeners["mouse:down"] = [];
		console.log(canvas.__eventListeners);
	};


	return {
		name: "Text",
		init: function() {
			console.log("init text");
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate,
	};

});