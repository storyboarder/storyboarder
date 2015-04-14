define(["jquery", "./Editor"], function(jquery, editor) {

  var init = function() {
    $("a.tool").click(function () {
      console.log($(this).attr('id'));
      editor.activate($(this).attr('id'));
      $( this ).addClass("current");
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
