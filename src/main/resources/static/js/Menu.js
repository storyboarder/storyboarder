define(["jquery", "semanticui", "./Editor"], function($, semanticui, editor) {
	//define(["jquery", "semanticui", "./Editor"], function(jquery, ui, editor) {

	var current;

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
		  editor.action($(this).attr('id'), {});
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