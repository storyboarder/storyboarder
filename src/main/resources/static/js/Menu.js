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

			var group = {
				url: $("#image-url").val()
			};
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
			// console.log("load called");
			// $('.ui.modal.load-project').modal('show');
			$('.ui.modal.load-project')
				.modal('setting', 'closable', true)
				.modal('show');

			$("#project-choices").empty();
			editor.action("GetChoices", function(choices) {
				for (c in choices) {
					$("#project-choices").append('<div class="item"><a id="' + c + '">' + choices[c] + '</a></div>');
				}
				$("#project-choices .item a").click(function() {
					views["LoadProject"]($(this));
				});
			});
		},
		"New": function() {
			console.log("new called");
			$('.ui.modal.create-project').modal('show');
		},
		"AddPage": function() {
			console.log("menu ADD PAGE");
			var idx = $("#page-thumbs").children(".page-thumb").length;
			var $html = $makePageThumb(idx);
			$("#page-thumbs").append($html);
			var that = this;
			editor.action("AddPage", {
				callback: function(numPages) {
					that.SetHeading({
						currentPage: numPages,
						numPages: numPages
					});
					that.SetCurrentPage($html);
				}
			});
		},
		"GetPage": function(item) {
			this.SetCurrentPage(item.parent());
			var idx = parseInt(item.parent().attr("id"));
			this.SetHeading({
				currentPage: idx
			});
			console.log("menu getting page" + idx);
			editor.action("GetPage", {
				pageNum: idx
			});
		},
		"RemovePage": function(item) {
			console.log("menu REMOVE PAGE");
			var idx = parseInt(item.parent().attr("id"));
			item.parent().remove();
			adjustPageThumbID();
			var that = this;
			editor.action("RemovePage", {
				pageNum: idx,
				callback: function(curr, num) {
					that.UpdatePages(curr, num);
					if (num == 0) {
						//					console.log("can't have 0 pages. Adding page...");
						that.AddPage();
					}
				}
			});
		},
		"SetPageDimensions": function(w, h) {
			$('#page').width(w);
			$('#page').height(h);
		},
		"CreateProject": function(form) {
			console.log("create project with name ", $("#project-name").val());
			$("#page-thumbs").empty();
			$('.ui.modal.create-project').modal('hide');
			width = parseInt($("#page-width").val());
			height = parseInt($("#page-height").val());
			this.SetPageDimensions(width, height);
			$("#editor").css("visibility", "visible");
			$("#Select").click();
			var that = this;
			$currPg = $makePageThumb(0);
			$("#page-thumbs").append($currPg);
			this.SetCurrentPage($currPg);
			editor.action("CreateProj", {
				canvas: $("#canvas"),
				width: parseInt($("#page-width").val()),
				height: parseInt($("#page-height").val()),
				pageMargin: parseInt($("#page-margin").val()),
				panelMargin: parseInt($("#panel-margin").val()),
				name: $("#project-name").val(),
				callback: function(response) {
					setThumbnailDimensions(editor.getThumbDimensions());
					console.log("thumbnailDim", thumbnailDim);
					$("input[type='text'].action").each(function(e) {
						set_value($(this));
					});
					that.SetHeading({
						title: response.name,
						currentPage: 1,
						numPages: 1
					});

				}
			});
		},
		"SetCurrentPage": function($currPg) {
			if (typeof $currentPage != "undefined") {
				$currentPage.removeClass("current");
			}
			$currPg.addClass("current");
			$currentPage = $currPg;
		},
		/* Updates page index in heading, and current page, but not thumbnails */
		"UpdatePages": function(curr, num) {
			console.log("UPDATE PAGES", curr, num);
			this.SetHeading({
				currentPage: curr,
				numPages: num
			});
			if ($("#page-thumbs").length > 0) {
				this.SetCurrentPage(getNthPageThumb(curr));
			}
		},
		"SetHeading": function(params) {
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
		"LoadProject": function(item) {
			var num = item.attr("id");
			this.SetHeading({
				title: item[0].firstChild.textContent
			});
			$("#Select").click();
			console.log("load project");
			var that = this;
			var result = editor.action("LoadProj", {
				name: item[0].textContent,
				callback: function(response) {
					that.SetHeading({
						title: response.title,
						currentPage: 1,
						numPages: response.numPages
					});
					setThumbnailDimensions(editor.getThumbDimensions());
					that.UpdatePages(1, response.numPages);
					that.SetPageDimensions(response.page.json.width, response.page.json.height);
					that.SetThumbnails(response.numPages, response.thumbnails);
					console.log("thumbnailDim", thumbnailDim);

				}
			});
			$("#editor").css("visibility", "visible");
			$('.ui.modal.load-project').modal('hide');
		},
		"NewProject": function(item) {
			console.log("new project");
			$('.ui.modal.create-project').modal('show');
		},
		"MovePage": function(start, end) {
			console.log("reordering pages: " + start + " to " + end);
			editor.action("MovePage", {
				pageNum: start,
				newSpot: end
			});
			adjustPageThumbID();
//	    getNthPageThumb(start).attr("id", start);
//	    getNthPageThumb(end).attr("id", end);
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
		$thumbs = $("#page-thumbs").children(".page-thumb");
		for (t = 0; t < $thumbs.length; t++) {
			$thumbs.eq(t).attr("id", t + 1);
		}
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
		style = "";
		var $th = $('<li class="page-thumb" id="' + i + '">' +
			'<a class="page-thumb view" id="GetPage" href="#"><img /></a>' +
			'<a href="#" class="remove-page view" id="RemovePage">' +
			'<i class="fa fa-x fa-remove"></i></a></li>');
		if (dataURL) {
			$img = $th.children("a.page-thumb").children("img");
			$img.attr("src", dataURL);
		}
		console.log("thumbnailDim", thumbnailDim);
		if (typeof thumbnailDim != "undefined") {
			$th.width(thumbnailDim.width).height(thumbnailDim.height);
		}
		return $th;
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
				$("#project-choices").append('<div class="item"><a id="' + c + '">' + choices[c] + '</a></div>');
			}
			$("#project-choices .item a").click(function() {
				views["LoadProject"]($(this));
			});
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

	var view = function(item) {
		var id = item.attr('id');
		if (id in views) {
			views[id](item);
		} else {
			throw "View not found: " + id;
		}
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

		var darken_link = function($obj) {
			$obj.addClass("current");
			setTimeout(function() {
				$obj.removeClass("current")
			}, 150);
		};

		$("a.action").click(function() {
			darken_link($(this));
			editor.action($(this).attr('id'), {
				name: $(this).attr('name')
			});
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

		$(".view").click(function() {
			darken_link($(this));
			view($(this));
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
				var imgObj = new Image();
				imgObj.src = event.target.result;
				imgObj.onload = function() {
					var image = new fabric.Image(imgObj);
					var group = {
						img: image
					};
					editor.action("AddImage", group);
				}
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

		$("#font-size").change(function(e) {
			$("#fsize").text($("#font-size").val());
			var active = canvas.getActiveObject();
			if (active && active.elmType === "rectext") {
				active.fontSize = $("#font-size").val();
				canvas.renderAll();
				active.adjustScale(active.left, active.top);
			}
		});

		$("#font-color").change(function(e) {
			var active = canvas.getActiveObject();
			if (active && active.elmType === "rectext") {
				active.fill = $("#font-color").val();
				canvas.renderAll();
			}
		});

		$("#font-family").change(function(e) {
			var active = canvas.getActiveObject();
			if (active && active.elmType === "rectext") {
				active.fontFamily = $('#font-family :selected').val();
				canvas.renderAll();
				active.adjustScale(active.left, active.top);
			}
		});

		$('#drawing-color').change(function() {
			console.log('color!');
			canvas.freeDrawingBrush.color = $('#drawing-color').val();
		});

		$('#drawing-line-width').change(function() {
			console.log('width!');
			canvas.freeDrawingBrush.width = $('#drawing-line-width').val();
		});

		$("#page-thumbs").disableSelection();

		init_project();

		editor.setProperty("Fill", "fillColor", $("#fill-color").val());
		$("#fill-color").on('input', function() {
			editor.setProperty("Fill", "fillColor", $(this).val());
		});

		/* Update the page thumb when Editor sends a save thumbnail event. */
		document.addEventListener("thumbnail", function(e) {
			setPageThumb(e.detail.pageNum, e.detail.thumbnail);
		})
	};

	return {
		init: init
	};
});