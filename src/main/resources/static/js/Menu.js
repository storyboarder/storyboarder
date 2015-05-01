define(["jquery", "jqueryui", "semanticui", "./Editor"], function($, jqueryui, semanticui, editor) {
	var current;

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
				url: $("#image-url").val(),
				active: canvas.getActiveObject()
			}

			editor.action("AddURL", group);
		},
		"Save": function() {
			console.log("save called");
			editor.action("SavePage", {});
			//TODO call editor
		},
		"Export": function() {
			editor.action("Export");
			//TODO call editor (and a modal?)
		},
		"Load": function() {
			console.log("load called");
			$('.ui.modal.load-project').modal('show');
		},
		"New": function() {
			console.log("new called");
			$('.ui.modal.create-project').modal('show');
		},
		"AddPage": function() {
			var idx = $("#page-thumbs").children(".page-thumb").length;
			console.log(idx);
			var html = getPageThumb(idx);
			$("#page-thumbs").append(html);
			editor.action("AddPage");
		},
		"GetPage": function(item) {
			var idx = parseInt(item.attr("data-num"));
			console.log("menu getting page" + idx);
			//TODO save current page
			editor.action("GetPage", idx);
		},
		"RemovePage": function(item) {
			var idx = item.attr("data-num");
			console.log("menu removing page" + idx);
			//TODO call editor
			item.parent(".page-thumb").remove();
		},
		"CreateProject": function(form) {
			console.log("create project with name ", $("#project-name").val());
			$('.ui.modal.create-project').modal('hide');
			$('#page').width(parseInt($("#page-width").val()));
			$('#page').height(parseInt($("#page-height").val()));
			console.log($('#canvas').width());
			$("#editor").css("visibility", "visible");
			editor.action("CreateProj", {
				canvas: $("#canvas"),
				width: parseInt($("#page-width").val()),
				height: parseInt($("#page-height").val()),
				pageMargin: parseInt($("#page-margin").val()),
				panelMargin: parseInt($("#panel-margin").val()),
				name: $("#project-name").val(),
				callback: function() {
					console.log("this is the callback passed to editor createproj");
					$("input[type='text'].action").each(function(e) {
						set_value($(this));
					});
					$("#page-thumbs").append(getPageThumb(1));
					console.log($("#page-thumbs"));
				}
			});
		},
		"LoadProject": function(item) {
			var num = item.attr("id");
			console.log("load project");
			var result = editor.action("LoadProj", {
				choice: num,
				callback: updatePages
			});
			$("#editor").css("visibility", "visible");
			$('.ui.modal.load-project').modal('hide');
		},
		"NewProject": function(item) {
			console.log("new project");
			$('.ui.modal.create-project').modal('show');
		},
//	  "CreateProject": function(form) {
//      console.log("create project");
//      $('.ui.modal.create-project').modal('hide');
//      $('#page').width(parseInt($("#page-width").val()));
//      $('#page').height(parseInt($("#page-height").val()));
//      console.log($('#canvas').width());
//      $("#editor").css("visibility", "visible");
//      editor.action("CreateProj", {
//        canvas: $("#canvas"),
//        width: parseInt($("#page-width").val()),
//        height: parseInt($("#page-height").val()),
//        pageMargin: parseInt($("#page-margin").val()),
//        panelMargin: parseInt($("#panel-margin").val()),
//        name: $("#filename").val(),
//        callback: function() {
//          $("input[type='text'].action").each(function(e) {
//            set_value($(this));
//          });
//        }
//      });
//      this.AddPage();
//	  },
//	  "LoadProject": function(item) {
//	    var num = item.attr("id");
//      console.log("load project");
//      var result = editor.action("LoadProj", {choice: num});
//      updatePages(result);
//      $("#editor").css("visibility", "visible");
//      $('.ui.modal.load-project').modal('hide');
//	  },
//	  "NewProject": function(item) {
//      console.log("new project");
//      $('.ui.modal.create-project').modal('show');
//	  },
	  "ReorderPages": function() {
	    console.log("reordering pages");
	    var arr = $( "#page-thumbs" ).sortable( "toArray" );
	    console.log(arr);
	  },
	};

	var getPageThumb = function(i) {
		i++;
		return '<li class="page-thumb" id="' + i + '">' +
			'<a class="page-thumb view" id="GetPage" href="#" data-num=' + i + '>' + i + '</a>' +
			'<a href="#" class="remove-page view" id="RemovePage" data-num=' + i + '><i class="fa fa-x fa-remove"></i></a></li>';
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

	var updatePages = function(num) {
		$("#page-thumbs").empty();
		for (var i = 0; i < num; i++) {
			console.log(i);
			$("#page-thumbs").append(getPageThumb(i));
		}
	};

	var set_value = function(item) {
		//    console.log("set value called");
		    console.log(item);
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
			if (current) {
				current.removeClass("current");
			}
			editor.activate($(this).attr('id'));
			$(this).addClass("current");
			current = $(this);
			console.log("current", $(this));
		});

		$("a.action").click(function() {
			console.log("action called");
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
			view($(this));
		});

		$("#page-thumbs").on("click", ".view", function() {
			view($(this));
		});

		$(".toolset .title").click(function() {
			$(this).parent().children(".tools").slideToggle();
		});

		$(".submenu").click(function() {
			console.log($(this).attr('id').toLowerCase());
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
						img: image,
						active: canvas.getActiveObject()
					}
					editor.action("AddImage", group);
				}
			}
			reader.readAsDataURL(e.target.files[0]);
		});

		$('.ui.radio.checkbox').checkbox();

		$("#page-thumbs").sortable({
			placeholder: "ui-state-placeholder",
			cancel: "a.remove-page",
			change: function(event, ui) {
				console.log(event);
				console.log(ui);
				views.ReorderPages();
			}
		});
		$("#page-thumbs").disableSelection();


		$("#font-size").change(function (e) {
			$("#fsize").text($("#font-size").val());
			var active = canvas.getActiveObject();
			if(active && active.elmType === "rectext") {
				active.fontSize = $("#font-size").val();
				canvas.renderAll();
				active.adjustBorder();	
			}
		});

		$("#font-color").change(function (e) {
			var active = canvas.getActiveObject();
			if(active && active.elmType === "rectext") {
				active.fill = $("#font-color").val();
				canvas.renderAll();
			}
		});


		$("#font-family").change(function (e) {
			var active = canvas.getActiveObject();
			if(active && active.elmType === "rectext") {
				active.fontFamily = $('#font-family :selected').val();
				canvas.renderAll();
				active.adjustBorder();
			}
		});

		$('#drawing-color').change(function () {
	        console.log('color!');
	        canvas.freeDrawingBrush.color = $('#drawing-color').val();
      	});

	    $('#drawing-line-width').change(function () {
		    console.log('width!');
		    canvas.freeDrawingBrush.width = $('#drawing-line-width').val();
	    });

	    $( "#page-thumbs" ).disableSelection();

		init_project();
	};

	return {
		init: init
	};
});