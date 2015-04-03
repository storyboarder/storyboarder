define(["../Editor"], function(editor) {
	$("#toolbar .split").click(function () {
		editor.activate("split");
	});
	tools = document.getElementsByClassName('tool');
	console.log(tools);

	for (var i = 0; i < tools.length; i++) {
		tools[i].addEventListener("click", function() {
			editor.activate(tools[i].id);
		});
	}
	return {};
});
