define(["./Editor"], function(editor) {
	$("#toolbar .split").click(function () {
		editor.activate("split");
	});
	

	return {};
});