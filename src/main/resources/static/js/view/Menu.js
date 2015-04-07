define(["../Editor"], function(editor) {
	
	$(".toolbar .tool").click(function () {
		console.log($(this));
		console.log($(this).attr('id'));
		editor.activate($(this).attr('id'));
	});

	return {};
});
