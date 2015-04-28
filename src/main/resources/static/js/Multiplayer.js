// Run java server to test
var s1 = new WebSocket("ws://localhost:8887");
s1.onmessage = function(e) {
	console.log(e);
};

var Multiplayer = {
	init: function () {
		socket = new WebSocket("ws://localhost:8887");

		socket.onmessage = recieveDelta;
	},

	sendDelta: function (delta) {
		socket.send(delta);
	},

	recieveDelta: function (e) {
		CanvasState.applyDeltaToState(e);
	}
};