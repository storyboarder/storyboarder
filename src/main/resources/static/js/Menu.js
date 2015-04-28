define(["jquery", "semanticui", "./Editor"], function($, semanticui, editor) {
	var current;

	var modals = {
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
		}
	};

	var forms = {
	  "CreateProject": function(form) {
      console.log($("#page-width").val(), $("#page-height").val());
      // TODO call editor create project
      $('.ui.modal.page-setup').modal('hide');
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
          console.log($(this));
          set_value($(this));
        });
      });
	  },
	  "LoadProject": function(num) {
      console.log($("#project-file").val());
      // TODO call editor load project
      editor.action("LoadProj", num);
      $('.ui.modal.page-setup').modal('hide');
      $('#page').width(parseInt($("#page-width").val()));
      $('#page').height(parseInt($("#page-height").val()));
      console.log($('#canvas').width());
      editor.init({
        canvas: $("#canvas"),
        width: parseInt($("#page-width").val()),
        height: parseInt($("#page-height").val()),
        pageMargin: parseInt($("#page-margin").val()),
        panelMargin: parseInt($("#panel-margin").val())
	    });
	  },
	};


	var init_project = function() {
		console.log($('.ui.modal.page-setup'));
		$('.ui.modal.page-setup')
			.modal('setting', 'closable', false)
			.modal('show');
		editor.action("GetChoices", function(choices) {
		  console.log(choices);
		  for (c in choices) {
		    $("#project-choices").append('<div class="item"><a id="' + c + '">' + choices[c] + '</a></div>');
		  }
		  $("#project-choices .item a").click(function() {
		    forms["LoadProject"](parseInt($(this).attr("id")));
		  });
		});

		console.log(editor);
	};

  var set_value = function(item) {
    console.log("text action called");
    console.log(item);
    var val = item.val();
    console.log(val);
    val = isNaN(val) ? val : parseInt(val);
    console.log(typeof val);
    console.log(isNaN(val) ? val : parseInt(val));
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
			if (id in modals) {
				modals[id]();
			} else {
				throw "Modal not found: " + name;
			}
		});

		$(".toolset .title").click(function() {
			$(this).parent().children(".tools").slideToggle();
		});

	$(".submenu").click(function() {
		console.log($(this).attr('id').toLowerCase());
		$( "." + $(this).attr("id").toLowerCase()).slideToggle();
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
			console.log(id);
			forms[id]();

		});

		init_project();
	};

	return {
		init: init
	};
});