define(["jquery", "semanticui", "./Editor"], function($, semanticui, editor) {
	var current;

	var views = {
		"Add Image": function() {
			console.log("add image called");
			$('.ui.modal.add-image').modal('setting', 'closable', false).modal('show');
			$('.upload').click(function() {
				$('.ui.modal.add-image').modal('hide');
				var imageLoader = document.getElementById('filepath');

				imageLoader.addEventListener('change', handleImage, false);

				function handleImage(e) {
					var reader = new FileReader();
					reader.onload = function(event) {
						var img = new Image();
						img.onload = function() {
							var imgInstance = new fabric.Image(img, {
								scaleX: 0.2,
								scaleY: 0.2
							})
							canvasState.addElement(imgInstance, "image");
						}
						img.src = event.target.result;
					}
					reader.readAsDataURL(e.target.files[0]);
				}

				console.log("ADDING");
				var send = {
					url: $("#image-url").val(),
					file: $("#filepath").val()
				}

				editor.action("Add Image", send);
			});
		},
		"Save": function() {
			console.log("save called");
			// $.post( "/save", {}, function( data ) {
			// console.log(data);
			// });
		},
		"Export": function() {
			console.log("export called");
		},
		"Load": function() {
			console.log("load called");
      $('.ui.modal.load-project').modal('show');
		},
		"New": function() {
		  console.log("new called");
      $('.ui.modal.create-project').modal('show');
		},
	};

	var actions = {
	  "CreateProject": function(form) {
      console.log("create project");
      $('.ui.modal.create-project').modal('hide');
      $('#page').width(parseInt($("#page-width").val()));
      $('#page').height(parseInt($("#page-height").val()));
      console.log($('#canvas').width());
      editor.init({
        canvas: $("#canvas"),
        width: parseInt($("#page-width").val()),
        height: parseInt($("#page-height").val()),
        pageMargin: parseInt($("#page-margin").val()),
        panelMargin: parseInt($("#panel-margin").val())
      }, function() {
        $("input[type='text'].action").each(function(e) {
          set_value($(this));
        });
      });
	  },
	  "LoadProject": function(num) {
      console.log("load project");
      editor.action("LoadProj", num);
      $("#editor").css("visibility", "visible");
      $('.ui.modal.load-project').modal('hide');
//      $('#page').width(parseInt($("#page-width").val()));
//      $('#page').height(parseInt($("#page-height").val()));
//      console.log($('#canvas').width());

	  },
	  "NewProject": function() {
      console.log("new project");
//      $('.ui.modal.load-project').modal('hide');
      $('.ui.modal.create-project').modal('show');

	  },
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
		    actions["LoadProject"](parseInt($(this).attr("id")));
		  });
		});
	};

  var set_value = function(item) {
//    console.log("set value called");
//    console.log(item);
    var val = item.val();
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

		$('.ui.checkbox')
			.checkbox();

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
			editor.action($(this).attr('data-action'), {name: $(this).attr('name')});
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

		$("a.modal").click(function() {
			console.log($(this).attr('id'));
			var id = $(this).attr('id');
			if (id in views) {
				views[id]();
			} else {
				throw "Modal not found: " + name;
			}
		});

		$(".toolset .title").click(function() {
			$(this).parent().children(".tools").slideToggle();
		});

		$("a.new-page").click(function() {
			console.log("new page");
		});

		$("a.remove-page").click(function() {
			console.log("remove page");
		});

		/* Form inits */
		$(".form-action").click(function() {
			console.log("form submitted");
			var id = $(this).attr("id");
			actions[id]();
		});

		init_project();
	};

	return {
		init: init
	};
});