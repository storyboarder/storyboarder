define(["../CanvasState"], function(canvasState) {
	var canvasState;

	// grid snap
	var gridSnap = {
		gridSpacing: 30,
		snapDistance: 8,
		grid: [],
		color: "#ddd",

		isActive: function() {
			return this.grid && this.grid.length > 0;
		},

		draw: function() {
			console.log("drawing grid...");
			gridSpacing = this.gridSpacing;
			color = this.color;
			if (this.grid && this.grid.length > 0) {
				this.clear();
			}
			var width = canvasState.getWidth();
			var height = canvasState.getHeight();
			var canvas = canvasState.getCanvas();
			for (var i = 0; i < (width / gridSpacing); i++) {
				var line = new fabric.Line(
					[i * gridSpacing, 0, i * gridSpacing, height], {
						stroke: color,
						selectable: false,
						helper: true
					}
				);
				canvasState.getCanvas().add(line);

				//canvas.add(line);
				line.sendToBack();
				this.grid.push(line);
			}
			for (var j = 0; j < (height / gridSpacing); j++) {
				var line = new fabric.Line(
					[0, j * gridSpacing, width, j * gridSpacing], {
						stroke: color,
						selectable: false,
						helper: true
					}
				);
				canvasState.getCanvas().add(line);
				//canvas.add(line);
				line.sendToBack();
				this.grid.push(line);
			}
		},

		clear: function() {
			for (g in this.grid) {
				//canvasState.getCanvas().remove(this.grid[g]);
				canvasState.getCanvas().remove(this.grid[g]);
			}
			this.grid = [];
		},


		snap: function(pt) {
			var spacing = gridSpacing;
			var tol = this.snapDistance;
			var _snap = function(value) {
				var dif = value % spacing;
				if (dif < tol) {
					return value - dif;
				} else if (spacing - dif < tol) {
					return value + spacing - dif;
				}
			};
			return {
				x: _snap(pt.x),
				y: _snap(pt.y)
			};
		},
	};

	var panelGridSnap = {
		panelRows: 3,
		panelColumns: 2,
		snapDistance: 10,
		grid: [],
		color: "#bbb",

		isActive: function() {
			return this.grid && this.grid.length > 0;
		},

		snap: function(value) {
			var pageEdges = canvasState.getPageEdges();
			var panelMargin = canvasState.getPanelMargin();
			var spacing = {
				x: (pageEdges.right - pageEdges.left - 2 * panelMargin) / panelColumns,
				y: (pageEdges.bottom - pageEdges.top - 2 * panelMargin) / panelRows
			};
			var tol = this.snapDistance;
			var _snap = function(dim, value) {
				var begin;
				if (dim == "x") {
					begin = pageEdges.left + panelMargin;
					dif = (value - begin) % spacing.x;
				} else if (dim == "y") {
					begin = pageEdges.top + panelMargin;
					dif = (value - begin) % spacing.y;
				} else {
					throw "invalid dimension" + dim;
				}
				if (dif < tol) {
					return value - dif;
				} else if (spacing[dim] - dif < tol) {
					return value + spacing[dim] - dif;
				}
			};
			return {
				x: _snap("x", value.x),
				y: _snap("y", value.y)
			};
		},

		draw: function() {
			console.log("drawing panel grid...");
			if (this.grid && this.grid.length > 0) {
				this.clear();
			}
			var width = canvasState.getWidth();
			var height = canvasState.getHeight();
			var canvas = canvasState.getCanvas();
			var pageEdges = canvasState.getPageEdges();
			var panelMargin = canvasState.getPanelMargin();
			var pageMargin = canvasState.getPageMargin();
			panelRows = this.panelRows;
			panelColumns = this.panelColumns;

			var h = (pageEdges.bottom - pageEdges.top - 2 * panelMargin) / panelRows;
			var begin = pageEdges.top + panelMargin;
			for (var i = 0; i <= panelRows; i++) {
				var line = new fabric.Line(
					[0, begin + h * i, width, begin + h * i], {
						stroke: this.color,
						selectable: false,
						helper: true
					}
				);
				canvas.add(line);
				line.sendToBack();
				this.grid.push(line);
			}
			var w = (pageEdges.right - pageEdges.left - 2 * panelMargin) / panelColumns;
			var begin = pageEdges.left + panelMargin;
			for (var j = 0; j <= panelColumns; j++) {
				var line = new fabric.Line(
					[begin + w * j, 0, begin + w * j, height], {
						stroke: this.color,
						selectable: false,
						helper: true
					}
				);
				canvas.add(line);
				line.sendToBack();
				this.grid.push(line);
			}
		},

		clear: function() {
			for (g in this.grid) {
				canvasState.getCanvas().remove(this.grid[g]);
			}
			this.grid = [];
		},
	};

	var snaps = {
		"gridSnap": gridSnap,
		"panelGridSnap": panelGridSnap
	};

	var getWidth = function(options) {
		return options.target.width * options.target.scaleX;
	};

	var getHeight = function(options) {
		return options.target.height * options.target.scaleY;
	};

	var dist = function(a, b) {
		return Math.abs(a - b);
	};

	var snapPoint = function(pt) {
		snapped = snapPointIfClose(pt);
		if (!snapped.x) {
			snapped.x = pt.x;
		}
		if (!snapped.y) {
			snapped.y = pt.y;
		}
		return snapped;
	};

	var snapPointIfClose = function(pt) {
		var snapped = {};
		for (s in snaps) {
			var snapObj = snaps[s];
			if (snapObj.isActive()) {
				var tmpPt = snapObj.snap(pt);
				if (tmpPt.y && (!snapped.y || Math.abs(tmpPt.y - pt.y) < Math.abs(snapped.y - pt.y))) {
					snapped.y = tmpPt.y;
				}
				if (tmpPt.x && (!snapped.x || Math.abs(tmpPt.x - pt.x) < Math.abs(snapped.x - pt.x))) {
					snapped.x = tmpPt.x;
				}
			}
		}
		return snapped;
	};

	return {
		setSnap: function(name, params) {
			if (name in snaps) {
				var snapObj = snaps[name];
				for (p in params) {
					if (p in snapObj) {
						snapObj[p] = params[p];
					}
				}
				if (snapObj.isActive()) {
					snapObj.draw();
				}
			} else {
				throw name + " is not a snap object";
			}
		},

		drawGrid: function(name) {
			if (name in snaps) {
				snaps[name].draw();
			} else {
				throw name + " is not a snap object";
			}
		},

		clearGrid: function(name) {
			if (name in snaps) {
				snaps[name].clear();
			} else {
				throw name + " is not a snap object";
			}
		},

		isSnapActive: function() {
			for (s in snaps) {
				if (snaps[s].isActive()) {
					return true;
				}
			}
			return false;
		},

		snapPoint: snapPoint,

		snapPointIfClose: snapPointIfClose,

		snapBorders: function(borders, control) {
			var snapped = {
				left: snapPointIfClose({
					x: borders.left
				}).x,
				right: snapPointIfClose({
					x: borders.right
				}).x,
				top: snapPointIfClose({
					y: borders.top
				}).y,
				bottom: snapPointIfClose({
					y: borders.bottom
				}).y,
			};
			var _deleteDuplicates = function(snapped, a, b) {
				if (snapped[a] && snapped[b]) {
					if (typeof control == "undefined") {
						if (dist(snapped[a], borders[a]) < dist(snapped[b], borders[b])) {
							delete snapped[b];
						} else {
							delete snapped[a];
						}
					} else {
						if (control.indexOf(a.charAt(0)) < 0) {
							delete snapped[a];
						}
						if (control.indexOf(b.charAt(0)) < 0) {
							delete snapped[b];
						}
					}
				}
			};
			_deleteDuplicates(snapped, "top", "bottom");
			_deleteDuplicates(snapped, "left", "right");
			return snapped;
		},
		snapObj: function(target) {
			if (target.elmType != "panel") {
				var padding = target.padding ? target.padding : 0;
				var tmpDim = {
						width: target.scaleX * target.width,
						height: target.scaleY * target.height
				};
				var borders = this.snapBorders({
					left: target.left - padding,
					right: target.left + tmpDim.width + padding,
					top: target.top - padding,
					bottom: target.top + tmpDim.height + padding
				});

				for (b in borders) {
					if (typeof borders[b] != "undefined") {
						if (b in target) {
							target[b] = borders[b] + padding;
						} else {
							var dim = canvasState.getDimension(b);
							var opposite = canvasState.getOppositeDirection(b);
							target[opposite] = borders[b] - tmpDim[dim] - padding;
						}
					}
				}
					canvasState.getCanvas().renderAll();
				if (target.elmType === "rectext") {
					canvasState.adjustBorder(target);
				}
			} 
		}
	}
});