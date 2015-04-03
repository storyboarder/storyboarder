
define(["../../CanvasState"], function (CanvasState) {

		
		var activate = function() {
			console.log("text activate");

			// adding text boxes and editing inside them, basically rect with label
			//-- can allow for stroke

			// click drag, creating a text box

			// double click, go into text box

			// if click again onto an textbox + text object, allow for resize?

			// toggling? 

			var initialPos;
			var finalPos;
			var selected;
			TEXT_PADDING = 20;

			canvas.on('mouse:down', function(coor) {
				
				initialPos = {
					x: coor.e.offsetX,
					y: coor.e.offsetY
				}

				selected = coor.target;
			});

			canvas.on('mouse:up', function(coor){
				
				finalPos = {
					x: coor.e.offsetX,
					y: coor.e.offsetY
				}
				console.log('up ' + finalPos.x + ' ' + finalPos.y);

				if(selected && selected.type !== 'i-text') {
					console.log('editing');

					if(Math.abs(initialPos.x - finalPos.x) > 50 && Math.abs(initialPos.y - finalPos.y) > 20) {
						console.log('creating text box');
						width = Math.abs(initialPos.x - finalPos.x);
						height = Math.abs(initialPos.y - finalPos.y);


					var input = new fabric.IText('Text', { 
				  		fontFamily: 'arial black',
				  		left: initialPos.x, 
				  		top: initialPos.y,
				  		fontSize: Math.floor(height / 2),
				  		width: width - TEXT_PADDING,
				  		height: height - TEXT_PADDING
					});

					canvasState.addElement(input, 'text');
					}
				}
				
			});

		};

		var deactivate = function() {
			console.log("text deactivate");
		};

	
	return {
		init: function () {
			console.log("init text");
			canvasState = CanvasState.getCanvasState();
			canvas = canvasState.getCanvas();
		},
		activate: activate,
		deactivate: deactivate()
	}
	
});