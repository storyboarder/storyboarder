define(["jquery", "semanticui", "./Editor"], function($, semanticui, editor) {
	var current;


		var modals = {
			"Add Image" : function() {
				console.log("add image called");
				$('.ui.modal.add-image').modal('setting', 'closable', false).modal('show');
				$('.upload').click(function() {
					$('.ui.modal.add-image').modal('hide');


				var imageLoader = document.getElementById('filepath');
				imageLoader.addEventListener('change', handleImage, false);

				function handleImage(e) {
				    var reader = new FileReader();
				    reader.onload = function (event) {
				        var img = new Image();
				        img.onload = function () {
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
			"Save" : function() {
				console.log("save called");
				// $.post( "/save", {}, function( data ) {
				// console.log(data);
				// });
			},
			"Export" : function() {
				console.log("export called");
			},
			"Load": function() {
	     		 console.log("load called");
	    	}
		};


	var init_project = function() {
		console.log($('.ui.modal.page-setup'));
		$('.ui.modal.page-setup')
			.modal('setting', 'closable', false)
			.modal('show');

		console.log(editor);
		$('.create-page').click(function() {
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
		});
	};


	var init = function() {
		console.log("Menu initing");

		//    $(".tools a").popup({
		//      padding: "2px",
		//    });

		$(document).keydown(function(e) {
			if (e.keyCode == 8 && e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
				e.preventDefault();
			}
		});

		$('.ui.checkbox')
      .checkbox()
    ;

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
		  editor.action($(this).attr('id'), {});
		});

		$("input[type='checkbox'].action").change(function() {
		  console.log("check action called");
		  editor.action($(this).attr('id'), {checked: $(this).prop("checked")});
		});

		$("input[type='text'].action").change(function() {
		  console.log("text action called");
		  editor.action($(this).attr('id'), {value: $(this).val()});

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

    $("a.new-page").click(function() {
      console.log("new page");
    });

    $("a.remove-page").click(function() {
      console.log("remove page");
    });



		init_project();
	};

	return {
		init: init
	};
});