var PageEditor = (function () {
	var init = function () {

	};

	var toggle = function (toolName) {

	};

	// Public API
	return {
		toggle: toggle,
		init: init
	};
})();


var Model = (function (PageEditor) {
	var init = function () {

	};

	var save = function () {
		$.post("url", {
			state: PageEditor.getState()
		});
	};

	return {
		init: init,
		save: save
	};
})(PageEditor);


var UserInterface = (function (PageEditor, Model) {
	var init = function () {
		$("#snap-to-grid").click(PageEditor.toggle("snapToGrid"));
		$("#resize-panel").click(PageEditor.toggle("resizePanel"));
		$("#save").click(Model.save());
		// ...
	};

	return {
		init: init
	};
})(PageEditor, Model);
