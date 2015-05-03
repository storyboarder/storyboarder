define(["../../CanvasState"], function(canvasState) {

	//bug: clicking on draw right after

	var canvas;
	var start = 0;
	var times = 0;

	var addGroup = function(group) {
		// console.log(3);
		//  console.log("PRINTING GROUP");
		//  console.log(group);

		//  var height = 0;
		//  var width = 0;
		//  var top = Number.POSITIVE_INFINITY;
		//  var left = Number.POSITIVE_INFINITY;

		testTop = group.reduce(function(prev, curr) {
			if (prev.top < curr.top) {
				return prev;
			} else {
				return curr;
			}
		}).top;

		testBottom = group.reduce(function(prev, curr) {
			if (prev.top + prev.height > curr.top + curr.height) {
				return prev;
			} else {
				return curr;
			}
		});

		testBottom = testBottom.top + testBottom.height;

		testLeft = group.reduce(function(prev, curr) {
			if (prev.left < curr.left) {
				return prev;
			} else {
				return curr;
			}
		}).left;

		testRight = group.reduce(function(prev, curr) {
			if (prev.left + prev.width > curr.left + curr.width) {
				return prev;
			} else {
				return curr;
			}
		});
		testRight = testRight.left + testRight.width;

		console.log("test numbers:", testTop, testBottom, testLeft, testRight);

		//  for(a in group) {
		//    var obj = group[a];
		//    console.log(4);
		//    console.log(obj);

		//    console.log("t " + obj.top);
		//    console.log("l " + obj.left);
		//    console.log("h " + obj.height);
		//    console.log("w " + obj.width);

		//    if(obj.top < top) {
		//      top = obj.top;
		//    }

		//    if(obj.left < left) {
		//      left = obj.left;
		//    }

		//    var newWidth = Math.abs(left - obj.left) + obj.width;
		//    var newHeight = Math.abs(top - obj.top) + obj.height;

		//    if(newWidth > width) {
		//      width = newWidth;
		//    }

		//    if(newHeight > height) {
		//      height = newHeight;
		//    }
		//  }

		//  console.log(5);
		//  console.log("l" + left);
		//  console.log("t" + top);
		//  console.log("h" + newHeight);
		//  console.log("w" + newWidth);

		// group.map(function(el) {
		//   el.left -= testLeft+ testRight;
		//   el.top -= testTop + testBottom;
		//   // el.left -= (testLeft+ testRight)/2;
		//   // el.top -= (testTop +testBottom)/2;

		// });
		// console.log("group", group);

		// var newGroup = new fabric.Group();


		var newGroup = new fabric.PathGroup(group, {
			hasControls: true,
			top: testTop,
			left: testLeft,
			height: testBottom - testTop,
			width: testRight - testLeft
		});
		/*
				for(a in newGroup.item) {
				var el = newGroup.item[a];
				console.log(el.left);
				el.set({left: -200, top: -200});
				//console.log(el.left);
				//el.setCoords();
				}*/

		// var newGroup = new fabric.PathGroup(group, {
		//   hasBorders: true,
		//   hasControls: true,
		//   top: 100,
		//   left: 100,
		//   width: 400,
		//   height: 300
		// });
		//var newGroup = new fabric.Group(group);
		console.log("LOOK HERE");
		console.log(newGroup);
		console.log(6);
		canvas._objects.splice(start, times);
		canvasState.addElement(newGroup, "draw");
		//canvas.setActiveGroup(newGroup);
		//canvas.bringToFront(newGroup);
		//canvas.renderAll();
		console.log(canvas);
	}

	var activate = function() {
		canvas = canvasState.getCanvas();
		//start = canvas._objects.length;
		//console.log("start " + start);

		console.log("draw activated");

		canvas.isDrawingMode = true;
		//fabric.Object.prototype.transparentCorners = false;

		canvas.freeDrawingBrush.color = $('#drawing-color').val();
		canvas.freeDrawingBrush.width = $('#drawing-line-width').val();

		canvas.on("mouse:up", function() {
			//times++;
			//console.log(times);
			if (canvas.isDrawingMode) canvas.trigger("change");
			console.log(canvas);
		});

		return this;
	};

	var deactivate = function() {
		console.log("draw deactivate");
		canvas.isDrawingMode = false;

		/*      console.log("times " + times);
				console.log(canvas);

				var group = [];
				var i;

				for(i = start; i <= times + 1; i++) {
				console.log(1);
				group.push(canvas._objects[i]);
				}
				console.log(2);
				addGroup(group);

				console.log(7);*/

		// DOESN'T LIKE ADDELEMENT FOR SOME REASON
		//canvas.add(toAdd);
		//canvas.renderAll();
		//fabric.Object.prototype.transparentCorners = true;

		canvas.off("mouse:up");
		// times = 0;
		// console.log("end " + times);

	};

	return {
		name: "Draw",
		activate: activate,
		deactivate: deactivate
	};

});