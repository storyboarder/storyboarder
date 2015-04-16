// Run java server to test
var s1 = new WebSocket("ws://localhost:8887");
s1.onmessage = function (e) {
	console.log(e);
};