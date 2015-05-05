define(["jquery", "jsondiffpatch", "fabricjs"], function($, jsondiffpatch) {

	var listenKeyboard = false;
	$(document).on('keydown', function(event) {
		console.log("key pressed:", event.keyCode, "Preventing defaults for special keys:", listenKeyboard);
		if (listenKeyboard) {
			copyPasteHandler(event);
		}
	});

	$(document).on('focus', "input[type=text]", function() {
		listenKeyboard = false;
	});

	$(document).on('blur', "input[type=text]", function() {
		listenKeyboard = true;
	});

	// Main canvas
	var canvas;
	var activeObj;
	var canvasId = "canvas";
	// Socket for multiplayer
	var socket;

	var width;
	var height;
	var thumb_width = 120;
	var thumb_height;
	var pageMargin;
	var panelMargin;
	// Edges of panel area (between pageMargin and panelMargin)
	var pageEdges;

	var controls = ["bl", "br", "mb", "ml", "mr", "mt", "tl", "tr"];
	var edgeDirections = ["left", "top", "right", "bottom"];

	// Array of deltas in history
	var history;
	// Index indicating the current delta
	var historyIdx;
	// Previous state of the canvas (in json)
	var previousState;

	//fiddle for copypaste http://jsfiddle.net/tkfGs/287/
	var clipboard = {
		type: "empty",
		content: "empty"
	}; //for copy paste

	// Stupid fucking fix
	// but if you override fromObject and pass 
	// undefined to loadImage it will load images from a URL
	fabric.Image.fromObject = function(object, callback) {
		fabric.util.loadImage(object.src, function(img) {
			fabric.Image.prototype._initFilters.call(object, object, function(filters) {
				object.filters = filters || [];
				var instance = new fabric.Image(img, object);
				callback && callback(instance);
			});
		}, null, undefined);
	};

	// Adds and element to the canvas
	// elmType could be (eg. panel, image etc.)
	var addElement = function(e, elmType) {
		e.elmType = elmType;
		canvas.add(e);
	};

	//construct a clipboard
	var makeClipboard = function(type, content) {
		return {
			type: type,
			content: content
		};
	};

	//Event handler for copy paste (callback for document.onkeydown)
	var copyPasteHandler = function(event) {
		var key;
		if (window.event) {
			key = window.event.keyCode;
		} else {
			key = event.keyCode;
		}
		switch (key) {
			case 8: //delete
				console.log("delete shortcut");
				event.preventDefault();
				deleteActive();
			case 67: // C
				console.log("copy shortcut");
				modifierEvent(copy);
				break;
			case 86: // V
				console.log("paste shortcut");
				modifierEvent(paste);
				break;
			case 83: //S
				modifierEvent(function() {
					console.log("save shortcut");
					canvas.trigger("change");
				});
				break;
		}

		function modifierEvent(callback) {
			if (event.ctrlKey || event.metaKey) { //Ctrl or Cmnd
				event.preventDefault();
				callback();
			}
		}
	}

	//copy object to clipboard
	var copy = function(params) {
		if (canvas.getActiveGroup()) {
			clipboard = makeClipboard("group", canvas.getActiveGroup());
		} else if (canvas.getActiveObject()) {
			clipboard = makeClipboard("single", canvas.getActiveObject());
		}
		// console.log("copy called, clipboard: ", clipboard);
	}

	//paste object from cliboard
	var paste = function(params) {
		var offset = 20;
		// console.log("paste called, clipboard: ", clipboard);
		if (clipboard.type == "group") {
			var clonedObjects = [];
			var groupObjects = clipboard.content.objects;
			for (var i in groupObjects) {
				var newObj = groupObjects[i].clone(function(callbackRes) {
					callbackRes.set({
						left: callbackRes.left + offset,
						top: callbackRes.top + offset
					});
					clonedObjects.push(callbackRes);
				});
				// if (newObj !== undefined) {
				// 	clonedObjects.push(newObj);
				// }
			}
			var clonedGroup = new fabric.Group(clonedObjects, {
				left: clipboard.content.left + offset,
				top: clipboard.content.top + offset
			});
			clipboard = makeClipboard("group", clonedGroup);
			var destroyedGroup = clonedGroup.destroy();
			var items = destroyedGroup.getObjects();
			items.forEach(function(item) {
				canvas.add(item);
			});
		} else if (clipboard.type == "single") {
			// console.log("copied object", clipboard.content);
			var clonedObj = clipboard.content.clone(function(callbackRes) {
				callbackRes.set({
					left: callbackRes.left + offset,
					top: callbackRes.top + offset
				});
				clipboard = makeClipboard("single", callbackRes);

				canvas.add(callbackRes);
			});
			if (clonedObj !== undefined) {
				// console.log("cloned object", clonedObj);
				clonedObj.set({
					left: clonedObj.left + offset,
					top: clonedObj.top + offset
				});
				clipboard = makeClipboard("single", clonedObj);
				canvas.add(clonedObj);
			}
		}
		canvas.renderAll();
		canvas.trigger("change");
	};

	var deleteElement = function(obj) {
		canvas.remove(obj);
	}

	var deleteActive = function(key) {
		if (canvas.getActiveGroup()) {
			remove(canvas.getActiveGroup());
			canvas.getActiveGroup().forEachObject(remove);
			canvas.discardActiveGroup();
		} else if (canvas.getActiveObject()) {
			remove(canvas.getActiveObject());
		}
		canvas.renderAll();
		canvas.trigger("change");

		function remove(obj) {
			if (obj.elmType === "rectext") {
				var borderArr = canvas._objects.filter(function(found) {
					return found.id === obj.id && found.elmType === "textBorder";
				});

				if (borderArr.length > 0) {
					var border = borderArr[0];
					canvas.remove(border);
					canvas.remove(obj);
				}
			} else if (obj.elmType !== 'panel' && obj.helper === undefined) {
				canvas.remove(obj);
			}
		}
	};

	// Add image to canvas
	var addImage = function(img, active) {
		// Set position and scale
		img.set({
			left: 100,
			top: 100,
			scaleX: 0.3,
			scaleY: 0.3
		});

		// Disable controls on image
		img.setControlsVisibility({
			mt: false,
			mb: false,
			ml: false,
			mr: false
		});

		if (active && active.elmType === "panel") {
			
			img.clipTo = clipTo(active);
			img.set({
				left: active.left + 15,
				top: active.top + 15,
				id : active.id
			});
		}

		// Add image element to canvas
		addElement(img, "image");
		canvas.renderAll();
		canvas.trigger("change");
	};

	// ---
	var setControls = function(panel) {
		var bounds = [];
		var options = {};
		for (var e in edgeDirections) {
			if (pageEdges[edgeDirections[e]] == panel.edges[edgeDirections[e]]) {
				bounds.push(edgeDirections[e].substring(0, 1));
			}
		}
		for (var c in controls) {
			options[controls[c]] = true;
			for (var b in bounds) {
				if (controls[c].indexOf(bounds[b]) >= 0) {
					options[controls[c]] = false;
				}
			}
		}
		panel.setControlsVisibility(options);
	};

	/* edges should be an object with left, top, right, and bottom keys */
	var addPanel = function(edges, fill) {
		var panel = new fabric.Rect({
			left: edges.left + panelMargin,
			top: edges.top + panelMargin,
			width: edges.right - edges.left - 2 * panelMargin,
			height: edges.bottom - edges.top - 2 * panelMargin,
			fill: fill || "rgba(0, 0, 0, 0)", // transparent
			stroke: "black",
			strokeWeight: 1,
			lockMovementX: true,
			lockMovementY: true,
			lockScalingX: true,
			lockScalingY: true,
			hasRotatingPoint: false,
			id : newId()
		});
		panel.edges = edges;
		setControls(panel);
		addElement(panel, "panel");
		canvas.bringToFront(panel);
		return panel;
	};

	// Returns the direction opposite to the one given
	var getOppositeDirection = function(edgeDir) {
		var opposites = {
			"top": "bottom",
			"bottom": "top",
			"left": "right",
			"right": "left"
		};

		if (edgeDir in opposites) {
			return opposites[edgeDir];
		} else {
			throw "Invalid edge direction " + edgeDir;
		}
	};

	// Returns the dimension that corresponds to the edge
	var getDimension = function(edgeDir) {
		switch (edgeDir) {
			case "top":
			case "bottom":
				return "height";
				break;
			case "left":
			case "right":
				return "width";
				break;
			default:
				throw "Invalid edge direction " + edgeDir;
				break;
		}
	};

	// Checks if a value is between two values
	var between = function(lower, val, upper) {
		return (lower <= val && val <= upper);
	};

	//
	var contains = function(d, x) {
		var min = pageMargin + panelMargin;
		var max = canvas[getDimension(d)] - min;
		return between(min, x, max);
	};

	/* Should be called at the beginning of the entire client session (sets up fabricjs objects) */
	var init = function() {
		canvas = new fabric.Canvas(canvasId, {
			selection: false
		});
		CanvasState.listenCanvas();
	};

	/* Should be called when a new page is loaded (project variables stay the same) */
	var init_page = function(callback) {
		// console.log("INIT PAGE");
		if (typeof canvas === "undefined") {
			// console.log("canvas is undefined. initing now...");
			init();
		}
		canvas.clear();
		pageEdges = {
			left: pageMargin,
			top: pageMargin,
			right: canvas.getWidth() - pageMargin,
			bottom: canvas.getHeight() - pageMargin
		};
		addPanel($.extend({}, pageEdges));

		//		console.log("CALLBACK WOOHOOOOFAFDAFA", callback);
		if (typeof callback !== "undefined") {
			callback();
		}

		activeObj = null;

		listenKeyboard = true;

		CanvasState.initHistory();

	};

	/* Should be called when a project is loaded or created (sets project variables, initializes first page) */
	var init_project = function(w, h, panelM, pageM, createProjCallback) {
		if (typeof canvas === "undefined") {
			init();
		}
		width = w;
		height = h;
		thumb_height = (thumb_width / width) * height;
		pageMargin = pageM;
		panelMargin = panelM;
		canvas.setDimensions({
			width: w,
			height: h
		});
		init_page(createProjCallback);
	};

	// for text
	var adjustBorder = function(obj) {
		var borderArr = canvas._objects.filter(function(found) {
			return found.id === obj.id && found.elmType === "textBorder";
		});

		if (borderArr.length > 0) {
			var border = borderArr[0];
			border.set({
				width: (obj.width * obj.scaleX) + (2 * obj.padding),
				height: (obj.height * obj.scaleY) + (2 * obj.padding),
				left: obj.left - obj.padding,
				top: obj.top - obj.padding,
				scaleX: 1,
				scaleY: 1
			});

			canvas.renderAll();

		}
	}

	var newId = function() {
		var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
		var id = randLetter + Date.now();
		return id;
	}

	var clipTo = function(panel) {
		return function(ctx) {ctx.save();ctx.setTransform(1, 0, 0, 1, 0, 0);ctx.rect(panel.left + 1, panel.top + 1, panel.width - 1, panel.height - 1);ctx.restore();};
	}


	var CanvasState = {
		newId : newId,
		clipTo : clipTo,
		copyPasteHandler : function(event) {
			copyPasteHandler(event);
		},
		adjustBorder: function(obj) {
			adjustBorder(obj);
		},
		setActiveObj: function(obj) {
			console.log("Set active to ", obj);
			if (obj && !obj.active) {
				return;
			}
			if (activeObj && activeObj.elmType === "panel") {
				activeObj.set({
					stroke: "black",
					strokeWidth: 1,
				});
			}

			activeObj = obj;

			if (obj && obj.elmType === "panel") {
				obj.set({
					stroke: "#009fda",
					strokeWidth: 2,
				});
			}

			canvas.renderAll();
		},
		getActiveObj: function() {
			return activeObj;
		},
		initHistory: function() {
			history = [];
			historyIdx = -1;
			previousState = CanvasState.getState();
		},
		storeState: function() {
			var state = this.getState();
			//console.log("storing a new state...", state);

			var delta = jsondiffpatch.diff(state, previousState);
			history[++historyIdx] = delta;
			previousState = state;
			canvas.trigger('stateUpdated', jsondiffpatch.reverse(delta));

			// console.log("History length: ", history.length);

			return delta;
		},
		canRevert: function() {
			return historyIdx >= 0;
		},
		canRestore: function() {
			return (historyIdx <= history.length - 1);
		},
		revertState: function() {
			if (!this.canRevert()) return;

			// Move previous state one back
			var delta = history[historyIdx];
			// socket.send(JSON.stringify(delta));
			previousState = jsondiffpatch.patch(previousState, delta);
			historyIdx--;

			// Repaint canvas
			canvas.clear().renderAll();
			canvas.loadFromJSON(previousState, canvas.renderAll.bind(canvas));

			canvas.trigger('stateUpdated', delta);
		},
		restoreState: function() {
			if (!this.canRestore()) return;

			// Move prebious state one forward
			state = this.getState();
			historyIdx++;
			var delta = jsondiffpatch.reverse(history[historyIdx]);
			var nextState = jsondiffpatch.patch(state, delta);

			// Repaint canvas
			canvas.clear().renderAll();
			canvas.loadFromJSON(nextState, canvas.renderAll.bind(canvas));

			canvas.trigger('stateUpdated', delta);
		},
		listenCanvas: function() {
			canvas.on('change', this.storeState.bind(this));
		},
		unlistenCanvas: function() {
			canvas.off('change', this.storeState.bind(this));
		},
		turnOnKeyListener: function() {
			listenKeyboard = true;
		},
		turnOffKeyListener: function() {
			listenKeyboard = false;
		},
		getState: function() {

			var state = $.extend(this.getCanvas().toJSON([
				"helper", "elmType", "edges",
				"lockMovementX", "lockMovementY",
				"lockScalingX", "lockScalingY",
				"selectable", "id",
				"_controlsVisibility",
				"hasRotatingPoint", "padding"
			]), {
				width: width,
				height: height,
				pageMargin: pageMargin,
				panelMargin: panelMargin
			});

			// Remove helper objects from canvas
			state.objects = state.objects.filter(function(obj) {
				return !obj.helper;
			});

			// reformat is for text
			//var reformat = JSON.stringify(state);

			// removing cliptTo for paths and images
			var objectJson = JSON.parse(JSON.stringify(state));

//			console.log(objectJson);
			objectJson.objects.map(function(found) {

				if(found.type === "path" || found.elmType === "image") {
					// console.log("HERE", found);
					found.clipTo = null;
					// console.log("THERE", found);
				} else if (found.elmType === "panel") {
					found.strokeWidth = 1;
					found.stroke = "black";
				}
			});

			// stringify the object again*/
			//var reformat = JSON.stringify(objectJson);

			var reformat = JSON.stringify(objectJson);

			reformat = reformat.replace(/(?:\\n)/g, function(match) {
				return "\\" + match;
			});
			console.log("done getting state");

			return reformat;
		},
		getThumbnail: function() {
			var thumb_width = 120;

			return canvas.toDataURL({
				multiplier: thumb_width / width
			});
		},
		applyDeltaToState: function(delta) {
			this.unlistenCanvas();

			previousState = jsondiffpatch.patch(previousState, delta);
			canvas.loadFromJSON(previousState, canvas.renderAll.bind(canvas));

			this.listenCanvas();
		},
		getCanvas: function() {
			return canvas;
		},
		getWidth: function() {
			return canvas.width;
		},
		getHeight: function() {
			return canvas.height;
		},
		getThumbWidth: function() {
			return thumb_width;
		},
		getThumbHeight: function() {
			return thumb_height;
		},
		/* f is a filter function (takes in type/element pair, returns boolean),
			m is a map function (modifies type/element pair) */
		mapElements: function(cb) {
			return canvas.getObjects().map(cb);
		},
		filterElements: function(cb) {
			return canvas.getObjects().filter(cb);
		},
		getOppositeDirection: getOppositeDirection,
		getDimension: getDimension,
		contains: contains,
		addPanel: addPanel,
		addImage: function(img) {
			addImage(img, this.getActiveObj());
		},
		setControls: setControls,
		getPageEdge: function(c) {
			return pageEdges[c];
		},
		getPageEdges: function() {
			return pageEdges;
		},
		load_page: function(canvasId, json, callback) {
			var that = this;
			init_page(function() {

				canvas.loadFromJSON(json, function() {
					var results = canvas.getObjects().filter(function(found) {
						return found.type === "path" || found.elmType === "image";
					});
					
					for(obj in results) {
						that.mapElements(
							function(found) {
								if (found.elmType === "panel") {
									if (found.id === results[obj].id) {
									results[obj].clipTo = that.clipTo(found);
									}
								}
							}
						);
					}

					canvas.renderAll.bind(canvas);
					canvas.renderAll();
//										console.log(canvas);
					if (typeof callback != "undefined") {
//						console.log(callback);
						callback();
					}
				});
			});
		},
		load_project: function(canvasId, json, callback) {
			var that = this;
			init_project(json.width, json.height, json.panelMargin, json.pageMargin, function() {
				canvas.loadFromJSON(json, function() {
					var results = canvas.getObjects().filter(function(found) {
						return found.type === "path" || found.elmType === "image";
					});
					
					for(obj in results) {
						that.mapElements(
							function(found) {
								if (found.elmType === "panel") {
									if (found.id === results[obj].id) {
									results[obj].clipTo = that.clipTo(found);
									}
								}
							}
						);
					}


					canvas.renderAll.bind(canvas);
					canvas.renderAll();
					if (typeof callback != "undefined") {
						callback();
					}
				});
			});
			// console.log("ENDING LOAD");
		},
		init: init,
		init_page: init_page,
		init_project: init_project,
		addElement: addElement,
		deleteElement: deleteElement,
		setPageMargin: function(p) {
			pageMargin = p;
		},
		setPanelMargin: function(p) {
			//        	throw "setting panel margin";
			panelMargin = p;
		},
		setPanelRows: function(p) {
			panelRows = p;
		},
		setPanelColumns: function(p) {
			panelColumns = p;
		},
		getPageMargin: function() {
			return pageMargin;
		},
		getPanelMargin: function() {
			return panelMargin;
		},
		saveCanvas: function() {
			return JSON.stringify(canvas);
		},
		loadCanvas: function(json) {
			canvas.loadFromJson(json, function() {
				canvas.renderAll();
			});
		}
	};
	return CanvasState;
});
