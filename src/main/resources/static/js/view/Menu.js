define(["../Editor"], function(editor) {
	$("#toolbar .split").click(function () {
		editor.activate("split");
	});

	console.log("#toolbar .tool");
	
	$("#toolbar .tool").click(function () {
		editor.activate($(this).id);
	});

	return {};
});
