define(["jquery", "jqueryui", "semanticui", "./Editor"], function($, jqueryui, semanticui, editor) {

	var $current; //HTML element of current tool
	var thumbnailDim; // {width: <number>, height: <number>}

	var loadProject = function (closable) {
		$('.ui.modal.load-project')
			.modal('setting', 'closable', closable)
			.modal('show');

		editor.action("GetChoices", function(choices) {
			for (c in choices) {
				var $loadLink = $("<a>").addClass("modalButton")
					.data("projectName", choices[c])
					.data("action", "LoadProject")
					.html(choices[c]);

				$("#project-choices").append(
					$("<div>").addClass("item").append($loadLink));
			}
		});
	};

	var getPageByNum = function (pageNum) {
		return $("#page-thumbs a.page-thumb").filter(function () {
			return $(this).data("pageNum") == pageNum;
		});
	};

	var addPage = function () {
		var pageNum = editor.get("numPages");
		var $html = $makePageThumb(pageNum);
		$("#page-thumbs").append($html);

		setCurrentPage(pageNum);
	};

	var setCurrentPage = function (pageNum) {
		console.log("setting page to ", pageNum);
		// Remove current from old thumb
		$(".current").removeClass("current");
		// Make given page the current thumb
		getPageByNum(pageNum).addClass("current");

		updateHeading();
	};

	var updateHeading = function() {
		$("#heading #title").html(editor.get("projectName"));
		$("#heading #currentPage").html(editor.get("currentPage").pageNum);
		$("#heading #numPages").html(editor.get("numPages"));
	};

	var removePage = function (pageNum) {
		$page = getPageByNum(pageNum);
		$page.parent().remove();
		updateThumbnailIDs();
	};

	var setPageThumb = function(pageNum, dataURL) {
		var $img = getPageByNum(pageNum).find("img");

		$img.attr("src", dataURL);
	};

	var setThumbnails = function (thumbs) {
		$("#page-thumbs").empty();
		for (var pageNum= 1; pageNum <= thumbs.length; pageNum++) {
			var thumbData = thumbs[pageNum-1];
			$thumb = $makePageThumb(pageNum, thumbData);
			$("#page-thumbs").append($thumb);
		}		
	};

	/* Aligns IDs of page thumbs to be {1, 2, 3...} corresponding to place in DOM */
	var updateThumbnailIDs = function() {
		$thumbs = $("#page-thumbs li");
		$thumbs.each(function (idx) {
			$(this).find(":data(pageNum)").data("pageNum", idx + 1);
		});
	};

	var $makePageThumb = function(pageNum, dataURL) {
		if (typeof pageNum !== "number") {
			throw "IllegalType: " + pageNum;
		}

		var dims = editor.getThumbDimensions();
		var $thumb = $("<li>")
			.addClass("page-thumb");
		// Link to click on thumbnail
		var $link = $("<a>").attr("href", "#")
			.addClass("page-thumb actionButton")
			.data("pageNum", pageNum)
			.data("action", "GetPage")
			.append("<img>")
			.appendTo($thumb);
		// Remove thumbnail link
		var $removeLink = $("<a>").attr("href", "#")
			.addClass("remove-page actionButton")
			.data("pageNum", pageNum)
			.data("action", "RemovePage")
			.appendTo($thumb);
		var $removeIcon = $("<i>")
			.addClass("fa fa-x fa-remove")
			.appendTo($removeLink);

		if (dataURL) {
			$img = $thumb.children("a.page-thumb").children("img");
			$img.width(dims.width)
				.height(dims.height)
				.attr("src", dataURL);
		}

		return $thumb;
	};

	// Events for when a tool property is changed
	var initPropertyChange = function () {
		editor.setProperty("Text", "fontFamily", $("#font-family").val());
		$("#font-family").change(function(e) {
			editor.setProperty("Text", "fontFamily", $(this).val());
		});

		editor.setProperty("Text", "fill", $("#font-color").val());
		$("#font-color").change(function () {
			editor.setProperty("Text", "fill", $(this).val());
		});

		editor.setProperty("Draw", "color", $('#drawing-color').val());
		$('#drawing-color').on('input', function() {
			editor.setProperty("Draw", "color", $(this).val());
		});

		editor.setProperty("Draw", "width", parseInt($('#drawing-line-width').val()));
		$('#drawing-line-width').change(function() {
			editor.setProperty("Draw", "width", parseInt($(this).val()));
		});

		console.log($("#fill-color").val());
		editor.setProperty("Fill", "fillColor", $("#fill-color").val());
		$("#fill-color").on('input', function() {
			editor.setProperty("Fill", "fillColor", $(this).val());
		});
	};

	// Binds events to buttons that show modals
	var initModals = function () {
		$("#AddImage").click(function () {
			$('.ui.modal.add-image').modal('show');
		});

		$("#New, #NewProject").click(function () {
			$('.ui.modal.create-project').modal('show');
		});

		$("#Load").click(function () {
			loadProject(true);
		});
	};


	// Listen for changes to the editor and update the ui
	// accordingly
	var initEditorListeners = function () {
		$(editor).on("addedPage", function (e, results, params) {
			addPage(results.pageNum);
			setPageThumb(results.pageNum, results.thumbnail);
		});

		$(editor).on("removedPage", function (e, results, params) {
			removePage(results.pageNum);
		});

		$(editor).on("movedPage", function (e, results, params) {
			updateThumbnailIDs();
		});

		$(editor).on("changedPage", function (e, results, params) {
			setCurrentPage(results.pageNum);
		});

		$(editor).on("savedPage", function (e, results, params) {
			setPageThumb(results.pageNum, results.thumbnail);
		});

		$(editor).on("loadedProject", function (e, results, params) {
			setThumbnails(results.thumbnails);
			setCurrentPage(1);

			$("#editor").css("visibility", "visible");
		});

		$(editor).on("createdProject", function (e, results) {
			// Removes old thumbnails
			// setPageDimensions($("#page-width").val(), $("#page-height").val());

			setThumbnails([]);
			setCurrentPage(1);
			$("#editor").css("visibility", "visible");
		});
	};

	// User interface intializer
	var init = function() {
		initModals();
		initEditorListeners();
		initPropertyChange();

		loadProject(false);

		$(document).keydown(function(e) {
			if (e.keyCode == 8 && e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
				e.preventDefault();
			}
		});

		/* Toolbar init */
		$(".tools a").popup({
			padding: "4px",
		});

		$('.ui.checkbox').checkbox();

		$("a.tool").click(function() {
			if ($current) {
				$current.removeClass("current");
			}
			editor.activate($(this).attr('id'));
			$(this).addClass("current");
			$current = $(this);
		});

		$("input[type='checkbox'].action").change(function() {
			editor.action($(this).attr('data-action'), {
				checked: $(this).prop("checked"),
				name: $(this).attr("name")
			});
		});

		$("input[type='text'].action").change(function() {
			set_value($(this));
		});

		$(document).on("click", ".actionButton", function() {
			editor.action($(this).data('action'), $(this).data());
		});

		$(document).on("click", ".modalButton", function() {
			var inputs = $(this).closest(".modal").find("input");
			// Create object from input values
			// in modal
			var params = $(this).data();
			inputs.each(function (input) {
				var value = $(this).val();
				value = $.isNumeric(value) ? parseFloat(value) : value;
				if ($(this).attr("name")) params[$(this).attr("name")] = value;
			});

			// Pass the object to the editor action
			editor.action($(this).data('action'), params);

			// Close the modal
			$(this).closest(".modal").modal('hide');
			editor.action("EnableKeyListener", {});
		});

		$("#page-thumbs").on("click", ".view", function() {
			if (!($(this).is('.ui-draggable-dragging'))) {
				view($(this));
			}
		});

		$(".toolset .title").click(function() {
			$(this).parent().children(".tools").slideToggle();
		});

		$(".submenu").click(function() {
			$("." + $(this).attr("id").toLowerCase()).slideToggle();
		});

		$('#filepath').change(function(e) {
			var reader = new FileReader();
			reader.onload = function(event) {
				new fabric.Image.fromURL(reader.result, function (img) {
					var group = { img: img };
					editor.action("AddImage", group);
				});
			}
			reader.readAsDataURL(e.target.files[0]);
		});

		$('.ui.radio.checkbox').checkbox();

		var startPageNum, endPageNum;

		$("#page-thumbs").sortable({
			placeholder: "ui-state-placeholder",
			cancel: "a.remove-page",
			distance: 10,
			start: function(event, ui) {
				startPageNum = ui.item.index() + 1;
			},
			stop: function(event, ui) {
				endPageNum = ui.item.index() + 1;
				console.log("Moved thumb " + startPageNum + " to " + endPageNum);
				editor.action("MovePage", {
					pageNum: startPageNum,
					newSpot: endPageNum
				});

				updateThumbnailIDs();
			}
		});
		$("#page-thumbs").disableSelection();

		$(".next-page").click(function() {
			var nextItem = $("#page-thumbs .page-thumb.current").next(".page-thumb");
			if (nextItem.length != 0) {
				getPage(nextItem.children("a"));
			}
		});

		$(".previous-page").click(function() {
			var prevItem = $("#page-thumbs .page-thumb.current").prev(".page-thumb");
			if (prevItem.length != 0) {
				getPage(prevItem.children("a"));
			}
		});

		$( "#page-thumbs" ).disableSelection();
	};

	return {
		init: init
	};
});