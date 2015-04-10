console.log("boo");
define(["./../Editor"], function(editor) {
	console.log("menu yo");
  console.log(editor);
  var init = function() {
    console.log("menu init");
    $("a.tool").click(function () {
      console.log($(this));
      console.log($(this).attr('id'));
      editor.activate($(this).attr('id'));
    });
  }

  return {
    init: init
  }
});
