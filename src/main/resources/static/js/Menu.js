define(["jquery", "jqueryui", "semanticui", "./Editor"], function($, jqueryui, semanticui, editor) {

	var $current; //HTML element of current tool
	var $currentPage; //HTML element of current page (in page nav)
	var thumbnailDim; // {width: <number>, height: <number>}

	// views is an object of functions. Each function will be passed the JQuery
	// object that triggered the view event.
	var views = {
		"AddImage": function() {
			console.log("add image called");
			$('.ui.modal.add-image').modal('setting', 'closable', true).modal('show');
		},
		"AddImageButton": function() {
			console.log("UPLOAD CLICKED");
			$('.ui.modal.add-image').modal('hide');

			var group = { url: $("#image-url").val() };
			editor.action("AddURL", group);
		},
		"Save": function() {
			console.log("save called");
			editor.action("SavePage", {});
		},
		"Export": function() {
			editor.action("Export");
		},
		"Load": function() {
			console.log("load called");
			$('.ui.modal.load-project').modal('show');
		},
		"New": function() {
			console.log("new called");
			$('.ui.modal.create-project').modal('show');
		},
		"GetPageByNum": function (pageNum) {
			return $("#page-thumbs a.page-thumb").filter(function () {
				return $(this).data("pageNum") == pageNum;
			});
		},
		"AddPage": function(params) {
			var idx = $("#page-thumbs").children(".page-thumb").length;
			var $html = $makePageThumb(idx);
			$("#page-thumbs").append($html);

			this.SetHeading({currentPage: params.currentPage, numPages: params.numPages});
		},
		"RemovePage": function(results) {
			console.log("menu REMOVE PAGE");
			console.log($("#page-thumbs li:data(pageNum)"));
			$page = this.GetPageByNum(results.pageNum);
			$page.parent().remove();
			adjustPageThumbID();
		},
		"SetCurrentPage": function(pageNum) {
			$toActivate = this.GetPageByNum(pageNum).addClass("current");
			if (typeof $currentPage != "undefined") {
				$currentPage.removeClass("current");
			}
			$currentPage = $toActivate;
		},
		"SetHeading": function(params) {
			console.log("set heading ", params);

			if (params.title) {
				$("#heading #title").html(params.title);
			}
			if (params.currentPage) {
				$("#heading #currentPage").html(params.currentPage);
			}
			if (params.numPages) {
				$("#heading #numPages").html(params.numPages);
			}
		},
		"MovePage": function(start, end) {
			console.log("reordering pages: " + start + " to " + end);
			editor.action("MovePage", {
				pageNum: start,
				newSpot: end
			});
			adjustPageThumbID();
		},
		"UpdateThumbnails": function() {
			console.log("UPDATE THUMBNAILS");
			editor.action("GetThumbs", {
				callback: function(response) {
					that.SetThumbnails(response.numPages, response.thumbnails);
				}
			});
		},
		"SetThumbnails": function(numPages, thumbs) {
			$("#page-thumbs").empty();
			for (t in thumbs) {
				$("#page-thumbs").append($makePageThumb(parseInt(t), thumbs[t]));
			}
		},
	};

	/* Aligns IDs of page thumbs to be {1, 2, 3...} corresponding to place in DOM */
	var adjustPageThumbID = function() {
		$thumbs = $("#page-thumbs li");
		$thumbs.each(function (idx) {
			$(this).find(":data(pageNum)").data("pageNum", idx + 1);
		});
	};

	var setThumbnailDimensions = function(obj) {
		thumbnailDim = thumbnailDim || {};
		thumbnailDim.width = obj.width;
		thumbnailDim.height = obj.height;
		$(".page-thumb").width(thumbnailDim.width).height(thumbnailDim.height);
	};

	var $makePageThumb = function(i, dataURL) {
		if (typeof i !== "number") {
			throw "IllegalType: " + i;
		}
		i++;

		var $thumb = $("<li>").addClass("page-thumb");
		// Link to click on thumbnail
		var $link = $("<a>").attr("href", "#")
			.addClass("page-thumb actionButton")
			.data("pageNum", i)
			.data("action", "GetPage")
			.append("<img>")
			.appendTo($thumb);
		// Remove thumbnail link
		var $removeLink = $("<a>").attr("href", "#")
			.addClass("remove-page actionButton")
			.data("pageNum", i)
			.data("action", "RemovePage")
			.appendTo($thumb);
		var $removeIcon = $("<i>")
			.addClass("fa fa-x fa-remove")
			.appendTo($removeLink);

		if (dataURL) {
			$img = $thumb.children("a.page-thumb").children("img");
			$img.attr("src", dataURL);
		}
		console.log("thumbnailDim", thumbnailDim);
		if (typeof thumbnailDim != "undefined") {
			$thumb.width(thumbnailDim.width).height(thumbnailDim.height);
		}
		return $thumb;
	};

	var setPageThumb = function(num, dataURL) {
		var $thumb = getNthPageThumb(num);
		var $img = $thumb.children("a.page-thumb").children("img");
		console.log("$img", $img);
		$img.attr("src", dataURL);
	};

	/* 1-indexed */
	var getNthPageThumb = function(n) {
		return $("#page-thumbs").children(".page-thumb").eq(n - 1);
	};

	var init_project = function() {
		$('.ui.modal.load-project')
			.modal('setting', 'closable', false)
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

	var updatePages = function(curr, num) {
		views.UpdatePages(curr, num);
	};

	var set_value = function(item) {
		var val = item.val();
		console.log(item.attr('data-action'), item.attr('name'), item.attr('id'));
		val = isNaN(val) ? val : parseInt(val);
		editor.action(item.attr('data-action'), {
			name: item.attr("name"),
			id: item.attr("id"),
			value: val
		});
	};

	var init = function() {
		console.log("Menu initing");


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
			console.log("check action called");
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

			console.log("modal params : ", params);
			// Pass the object to the editor action
			editor.action($(this).data('action'), params);

			// Close the modal
			$(this).closest(".modal").modal('hide');
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

		var page_thumb_idx;

		$("#page-thumbs").sortable({
			placeholder: "ui-state-placeholder",
			cancel: "a.remove-page",
			distance: 10,
			start: function(event, ui) {
				page_thumb_idx = ui.item.index();
			},
			stop: function(event, ui) {
				console.log("moved element " + (1 + page_thumb_idx) + " to " + (1 + ui.item.index()));
				views.MovePage(1 + page_thumb_idx, 1 + ui.item.index());
			}
		});
		$("#page-thumbs").disableSelection();

		$(".next-page").click(function() {
			var nextItem = $("#page-thumbs .page-thumb.current").next(".page-thumb");
			if (nextItem.length != 0) {
				views.GetPage(nextItem.children("a"));
			}
		});

		$(".previous-page").click(function() {
			var prevItem = $("#page-thumbs .page-thumb.current").prev(".page-thumb");
			if (prevItem.length != 0) {
				views.GetPage(prevItem.children("a"));
			}
		});

		$("#font-size").change(function (e) {
			$("#fsize").text($("#font-size").val());
			var active = canvas.getActiveObject();
			if(active && active.elmType === "rectext") {
				active.fontSize = $("#font-size").val();
				canvas.renderAll();
				//ADJUST BORDER NEEDED
				//active.adjustScale(active.left, active.top);
			}
		});

		$("#font-color").change(function (e) {
			var active = canvas.getActiveObject();
			if(active && active.elmType === "rectext") {
				active.fill = $("#font-color").val();
				canvas.renderAll();
			}
		});

		$("#font-family").change(function(e) {
			console.log("from family", canvas);
			var active = canvas.getActiveObject();
			if(active && active.elmType === "rectext") {
				active.fontFamily = $('#font-family :selected').val();
				canvas.renderAll();
				//ADJUST BORDER NEEDED
				//adjustScale(active.left, active.top);
			}
		});

		$('#drawing-color').change(function() {
			canvas.freeDrawingBrush.color = $('#drawing-color').val();
		});

		$('#drawing-line-width').change(function() {
			console.log("from drawing", canvas);
			canvas.freeDrawingBrush.width = parseInt($('#drawing-line-width').val());
		});


	    $( "#page-thumbs" ).disableSelection();

		init_project();

		editor.setProperty("Fill", "fillColor", $("#fill-color").val());
		$("#fill-color").on('input', function() {
			editor.setProperty("Fill", "fillColor", $(this).val());
		});

		$(editor).on("addedPage", function (e, results, params) {
			views.AddPage(results, params);
		});
		$(editor).on("removedPage", function (e, results, params) {
			views.RemovePage(results, params)
		});
		$(editor).on("movedPage", function (e, results, params) {
			views.MovePage(results, params)
		});
		$(editor).on("changedPage", function (e, results, params) {
			views.SetCurrentPage(results.pageNum);
		});
		$(editor).on("loadedProject", function (e, results, params) {
			views.SetHeading({
				title: results.name,
				currentPage: 1,
				numPages: results.numPages
			});

			views.SetThumbnails(results.numPages, results.thumbnails);
			views.SetCurrentPage(1);

			$("#editor").css("visibility", "visible");
		});
		$(editor).on("createdProject", function (e, results) {
			views.SetCurrentPage(1);
			$("#editor").css("visibility", "visible");
		});

		$("#AddImage").click(function () {
			$('.ui.modal.add-image').modal('show');
		});

		$("#NewProject").click(function () {
			$('.ui.modal.create-project').modal('show');
		});

		/* Update the page thumb when Editor sends a save thumbnail event. */
		document.addEventListener("thumbnail", function(e) {
			setPageThumb(e.detail.pageNum, e.detail.thumbnail);
		});
	};

	return {
		init: init
	};
});