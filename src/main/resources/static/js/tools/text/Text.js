
define(["../../CanvasState"], function (CanvasState) {

		var helper_function = function() {
			console.log("helper function");

		};

		var activate = function(CanvasState) {
			console.log("activate");
			var canvas = CanvasState.canvas; 

			// adding text boxes and editing inside them, basically rect with label
			//-- can allow for stroke

			// click drag, creating a text box

			// double click, go into text box

			// if click again onto an textbox + text object, allow for resize?

			// toggling? 

			/*
			canvas.on('mouse:over', function(e) {
			    if(e.target && e.target.type === 'text') {

			    }
		  	});

		  	canvas.on('mouse:out', function(e) {
		  	});

		  	*/

			var initialPos;
			var finalPos;

			canvas.on('mouse:down', function(coor) {
				console.log('down');
				initialPos = {
					x: coor.e.clientX,
					y: coor.e.clientY
				}
			});

			canvas.on('mouse:up', function(coor){
				console.log('up');
				finalPos = {
					x: coor.e.clientX,
					y: coor.e.clientY
				}

				if(coor.target && coor.target.type === 'text') {
					// allow for editing
				} else {
					var width;
					var height;
					if(Math.abs(initialPos.x - finalPos.x) > 50 && Math.abs(initialPos.y - finalPs.y) > 20) {
						width = Math.abs(initialPos.x - finalPos.x);
						height = Math.abs(initialPos.y - finalPs.y);
					} else {
						width = 150;
						height = 50;
					}

					var textBox = new fabric.Rect({
						width: width,
						height: height,
						left: initialPos.x,
						top: initialPos.y,
						fill: '#FFFFFF',
						originX: 'center',
						originY: 'center'
					});

					var text = new fabric.Text('hello world', {
					  	fontSize: Math.floor(height / 2),
				  		originX: 'center',
				  		originY: 'center'
					});

					var group = new fabric.Group([ textBox, text ], {
					 	left: initialPos.x,
					 	top: initialPos.y
					});

					canvas.add(group);

				}
				
			});

		};

		var deactivate = function() {
			console.log("deactivate");
		};

	return {
		activate: activate(CanvasState),
		deactivate: deactivate()
	}
});