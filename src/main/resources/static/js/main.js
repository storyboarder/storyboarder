/* canvas state object that is passed when tools are initialized */

/* tools will be modules containing:
   activate(CanvasState)
   deactivate() */

var ResizeTool = (function () {
	var _this = this;
	
	var activate = function () {
		$(_this).bind("resize", function () {
			
		});
	};
	
	var deactivate = function () {
		
	};
	
	return {
		activate: activate,
		deactivate: deactivate
	};
});

var PageEditor = (function () {
	
	var toolset = {
		//dictionary of all tool modules
	}

	var init = function () {

	};

	var toggle = function (toolName) {
		//retrieves new tool from toolset using toolName as the key	
	};

	// Public API
	return {
		toggle: toggle,
		init: init
	};
})();


function Model (PageEditor) {
	var init = (function () {
		
	})();

	var save = function () {
		$.post("url", {
			state: PageEditor.getState()
		});
	};

	return {
		save: save
	};	
};

new Model(new PageEditor());

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
