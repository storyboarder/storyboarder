define(["jquery", "./Editor"], function(jquery, editor) {

  var current;

  var init = function() {
    console.log("Menu initing");
    $(document).keydown(function(e){
        if (e.keyCode == 8 && e.target.tagName != 'INPUT' && e.target.tagName != 'TEXTAREA') {
            e.preventDefault();
        }
    });

    console.log($("a.tool"));
    $("a.tool").click(function () {
      if (current) {
        current.removeClass("current");
      }
      editor.activate($(this).attr('id'));
      $( this ).addClass("current");
      current = $(this);
      console.log(current);
      console.log("current", $( this ));
    });

    $(".toolset .title").click(function() {
      $(this).parent().children(".tools").slideToggle();
    });
  }

  return {
    init: init
  }
});
