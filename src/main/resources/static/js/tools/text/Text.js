define(["../../CanvasState"], function(canvasState) {

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

		// adding text boxes and editing inside them, basically rect with label
		//-- can allow for stroke

		// click drag, creating a text box

		// double click, go into text box

		// if click again onto an textbox + text object, allow for resize?

		// toggling? 
		var initialPos;
		var finalPos;
		var selected;
		var edit;
		TEXT_PADDING = 20;

		canvas.on('mouse:down', function(coor) {

			initialPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			}

			selected = coor.target;
			edit = coor.e.shiftKey;
		});

		canvas.on('mouse:up', function(coor) {

			finalPos = {
				x: coor.e.offsetX,
				y: coor.e.offsetY
			}

			// weird bug when I edit and then click out of the box
			// phantom group box....?
			if (selected && selected.type === 'text') {
				if (edit) {
					console.log("GROUP!!");
					var pos = {
						left: selected.left,
						top: selected.top
					}

					var items = selected._objects;
					var isText = false;
					var iText;
					console.log(items);
					for (i in items) {
						if (items[i].type === 'i-text') {
							isText = true;
							iText = items[i];
						}
					}

					if (isText) {
						console.log('checked text');
						selected._restoreObjectsState();
						canvasState.deleteElement(selected);
						for (var i = 0; i < items.length; i++) {
							canvas.add(items[i]);
							//canvas.item(canvas.size()-1).hasControls = true;
						}

						canvas.on("text:editing:exited", function(e) {
							console.log('finished editing');
							var group = new fabric.Group([items[0], items[1]], {
								left: pos.left,
								top: pos.top
							});

							canvasState.deleteElement(items[0]);
							canvasState.deleteElement(items[1]);
							canvasState.addElement(group, 'text');
						});
					}
				}
			} else {
				console.log('creating new group');

				if (Math.abs(initialPos.x - finalPos.x) > 50 && Math.abs(initialPos.y - finalPos.y) > 20) {
					width = Math.abs(initialPos.x - finalPos.x);
					height = Math.abs(initialPos.y - finalPos.y);

					var input = new fabric.IText('Text', {
						fontFamily: 'arial black',
						fontSize: 14,
						left: initialPos.x,
						top: initialPos.y
					});


					// var textBox = new fabric.Rect({
					// 	width : width,
					// 	height: height,
					// 	fill: 'white',
					// 	stroke: '#C0C0C0',
					// 	strokeDashArray: [5, 5]
					// });

					// var group = new fabric.Group([ textBox, input ], {
					//   left: initialPos.x,
					//   top: initialPos.y
					// });


					canvas.on('after:render', function() {
						canvas.contextContainer.strokeStyle = '#555';

						var bound = input.getBoundingRect();
						bound.strokeDashArray = [5, 5];
						canvas.contextContainer.strokeRect(
							bound.left + 0.7,
							bound.top + 0.7,
							bound.width,
							bound.height
						);
					});

					canvasState.addElement(input, 'text');

				} // if within range				
			} // else
		}); // mouseup

		document.onkeydown = function(e) {
			console.log("pressed");
			var key = e.keyCode;
			console.log(key);
			console.log(selected.type);
			if (key === 8 && selected.type === 'text') {
				console.log("delete");
				console.log(selected.type);
				canvasState.deleteElement(selected);
			}
		};
	};

	var deactivate = function() {
		console.log("text deactivate");
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