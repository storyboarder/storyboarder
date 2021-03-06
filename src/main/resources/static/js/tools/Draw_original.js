var canvas = new fabric.Canvas('c');
var drawingModeEl = document.getElementById('drawing-mode'),
	drawingOptionsEl = document.getElementById('drawing-mode-options'),
	drawingColorEl = document.getElementById('drawing-color'),
	drawingLineWidthEl = document.getElementById('drawing-line-width'),
	drawingShadowWidth = document.getElementById('drawing-shadow-width');

drawingModeEl.onclick = function() {
	canvas.isDrawingMode = !canvas.isDrawingMode;
	if (canvas.isDrawingMode) {
		drawingModeEl.innerHTML = 'Cancel drawing mode';
		drawingOptionsEl.style.display = '';
	} else {
		drawingModeEl.innerHTML = 'Enter drawing mode';
		drawingOptionsEl.style.display = 'none';
	}
};

canvas.on('path:created', function() {
	updateComplexity();
});

if (fabric.PatternBrush) {
	var vLinePatternBrush = new fabric.PatternBrush(canvas);
	vLinePatternBrush.getPatternSrc = function() {

		var patternCanvas = fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx = patternCanvas.getContext('2d');

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(0, 5);
		ctx.lineTo(10, 5);
		ctx.closePath();
		ctx.stroke();

		return patternCanvas;
	};

	var hLinePatternBrush = new fabric.PatternBrush(canvas);
	hLinePatternBrush.getPatternSrc = function() {

		var patternCanvas = fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx = patternCanvas.getContext('2d');

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(5, 0);
		ctx.lineTo(5, 10);
		ctx.closePath();
		ctx.stroke();

		return patternCanvas;
	};

	var squarePatternBrush = new fabric.PatternBrush(canvas);
	squarePatternBrush.getPatternSrc = function() {

		var squareWidth = 10,
			squareDistance = 2;

		var patternCanvas = fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
		var ctx = patternCanvas.getContext('2d');

		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, squareWidth, squareWidth);

		return patternCanvas;
	};

	var diamondPatternBrush = new fabric.PatternBrush(canvas);
	diamondPatternBrush.getPatternSrc = function() {

		var squareWidth = 10,
			squareDistance = 5;
		var patternCanvas = fabric.document.createElement('canvas');
		var rect = new fabric.Rect({
			width: squareWidth,
			height: squareWidth,
			angle: 45,
			fill: this.color
		});

		var canvasWidth = rect.getBoundingRectWidth();

		patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
		rect.set({
			left: canvasWidth / 2,
			top: canvasWidth / 2
		});

		var ctx = patternCanvas.getContext('2d');
		rect.render(ctx);

		return patternCanvas;
	};

	var img = new Image();
	img.src = '../assets/honey_im_subtle.png';

	var texturePatternBrush = new fabric.PatternBrush(canvas);
	texturePatternBrush.source = img;
}

document.getElementById('drawing-mode-selector').addEventListener('change', function() {

	if (this.value === 'hline') {
		canvas.freeDrawingBrush = vLinePatternBrush;
	} else if (this.value === 'vline') {
		canvas.freeDrawingBrush = hLinePatternBrush;
	} else if (this.value === 'square') {
		canvas.freeDrawingBrush = squarePatternBrush;
	} else if (this.value === 'diamond') {
		canvas.freeDrawingBrush = diamondPatternBrush;
	} else if (this.value === 'texture') {
		canvas.freeDrawingBrush = texturePatternBrush;
	} else {
		canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
	}

	if (canvas.freeDrawingBrush) {
		canvas.freeDrawingBrush.color = drawingColorEl.value;
		canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
		canvas.freeDrawingBrush.shadowBlur = parseInt(drawingShadowWidth.value, 10) || 0;
	}
});

drawingColorEl.onchange = function() {
	canvas.freeDrawingBrush.color = drawingColorEl.value;
};
drawingLineWidthEl.onchange = function() {
	canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
};
drawingShadowWidth.onchange = function() {
	canvas.freeDrawingBrush.shadowBlur = parseInt(drawingShadowWidth.value, 10) || 0;
};

if (canvas.freeDrawingBrush) {
	canvas.freeDrawingBrush.color = drawingColorEl.value;
	canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
	canvas.freeDrawingBrush.shadowBlur = 0;
}

document.getElementById('canvas-background-picker').addEventListener('change', function() {
	canvas.backgroundColor = this.value;
	canvas.renderAll();
});