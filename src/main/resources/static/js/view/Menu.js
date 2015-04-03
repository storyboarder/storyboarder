define(["../Editor"], function(editor) {
	$("#toolbar .split").click(function () {
		editor.activate("split");
	});
	
	$("#toolbar .text").click(function () {
		editor.activate("text");
	});

	return {};
});
