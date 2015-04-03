
define(["../../CanvasState"], function (CanvasState) {

		
		var activate = function() {

			canvasState.filterMapElements(
				function(e) { // filter
					return e.type == "group";
				},
				function(found) { // map
					found.element.set({selectable: true});
				}
			);

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

				if(selected && selected.type === 'group') {  //i-text
					console.log("group!!");
					var items = selected._objects;
					var isText = false;
					var iText;
					for(i in items) {
						console.log(items[i].type);
						if(items[i].type === 'i-text') {
							isText = true;
							iText = items[i];
						}
					}

					if(isText) {
						console.log('checked text');
						selected._restoreObjectsState();
				        canvasState.deleteElement(selected);
				        for(var i = 0; i < items.length; i++) {
				          canvas.add(items[i]);
				          //canvas.item(canvas.size()-1).hasControls = true;
				        }

				        if(iText.hasStateChanged()) {
				        	console.log("changed");
							var group = new fabric.Group([ items(0), items(1) ], {
							  left: items(1).left,
							  top: items(1).top
							});				        	
				        }

						document.onkeydown = function (e) {
							console.log("pressed");
						   	var key = e.keyCode;
						   	console.log(key);
						   	if(key === 8 && selected.type === 'group') {
						   		console.log("delete");
						   		console.log(selected.type);
						   		canvasState.deleteElement(selected);
						   	}
						}						
					}


				} else {	
					console.log('editing');

					if(Math.abs(initialPos.x - finalPos.x) > 50 && Math.abs(initialPos.y - finalPos.y) > 20) {
						console.log('creating text box');
						width = Math.abs(initialPos.x - finalPos.x);
						height = Math.abs(initialPos.y - finalPos.y);


					var input = new fabric.IText('Text', { 
				  		fontFamily: 'arial black',
				  		fontSize: 14,
				  		width: width - TEXT_PADDING,
				  		height: height - TEXT_PADDING
					});

					var textBox = new fabric.Rect({
						width : width,
						height: height,
						fill: 'white',
						stroke: '#C0C0C0',
						strokeDashArray: [5, 5]
					});

					var group = new fabric.Group([ textBox, input ], {
					  left: initialPos.x,
					  top: initialPos.y
					});

					//canvasState.addElement(input, 'text');
					canvasState.addElement(group, 'text');

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