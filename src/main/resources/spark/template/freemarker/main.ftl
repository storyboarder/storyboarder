<!DOCTYPE html>
<html>
<head>
	<title>Storyboarder</title>
	<link href='http://fonts.googleapis.com/css?family=PT+Sans:400,700' rel='stylesheet' type='text/css'>
	<link rel="stylesheet/less" type="text/css" href="css/styles.less">
	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/popup.min.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/transition.min.css" />

	<script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/2.4.0/less.min.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script data-main="js/main.js" src="js/require.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/popup.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/transition.min.js"></script>


</head>
<body>
<div id="container">
  <div id="navigator">
    <div>
      <div class="page-thumb">
        <a href="#" class="remove-page"><i class="fa fa-x fa-remove"></i></a>
      </div>
      <div class="page-thumb">
        <a href="#" class="remove-page"><i class="fa fa-x fa-remove"></i></a>
      </div>
    <a href="#" class="add-page-button"><i class="fa fa-x fa-plus"></i></a>
    </div>
  </div>

  <div id="editor">
      <div class="previous-page">
        <a href="#" data-content="Previous page"><i class="fa fa-x fa-caret-left"></i></a>
      </div>
      <div id="page">
        			<div class="canvas-bg">
        				<canvas id="canvas"></canvas>
        			</div>
      </div>
      <div class="next-page">
        <a href="#" data-content="Next page"><i class="fa fa-x fa-caret-right"></i></a>
      </div>

  </div>

  <div id="toolbar">
    <div class="title">Toolbar</div>

    <div class="toolset">
      <div class="title">Main</div>
      <div class="tools">
        <a href="#" class="tool" id="Select" data-content="Select"><i class="fa fa-x fa-location-arrow"></i></a>
        <a href="#" data-content="Undo"><i class="fa fa-x fa-undo"></i></a>
        <a href="#" data-content="Redo"><i class="fa fa-x fa-repeat"></i></a>
        <br>Grid: <input type="number" /> <input type="number" />

      </div>
    </div>

    <div class="toolset">
      <div class="title">Panel</div>
      <div class="tools">
        <a href="#" class="tool" id="Split" data-content="Split"><i class="fa fa-x fa-arrows-h"></i></a>
        <a class="tool" id="Join" data-content="Join"><i class="fa fa-x fa-sign-in"></i></a>
        <br>Margin size: <input type="number" />
        <br>Snap to grid: <input type="checkbox" />
      </div>
    </div>

    <div class="toolset">
      <div class="title">Image</div>
      <div class="tools">
        <a href="#" data-content="Add Image"><i class="fa fa-x fa-plus-circle"></i></a>
        <a href="#" data-content="Paint Brush"><i class="fa fa-x fa-paint-brush"></i></a>
        <a href="#" data-content="Fill"><i class="fa fa-x fa-bitbucket"></i></a>
        <a href="#" data-content="Eyedropper"><i class="fa fa-x fa-eyedropper"></i></a>
        <br>Snap to grid: <input type="checkbox" />
      </div>
    </div>

    <div class="toolset">
      <div class="title">Text</div>
      <div class="tools">
        <a href="#" class="tool" id="Text" data-content="Add Text"><i class="fa fa-x fa-plus-circle"></i></a>
        <br>Borders: <input type="radio" name="text-borders"/>ellipse <input type="radio" name="text-borders"/>rectangle <input type="radio" name="text-borders" checked="true"/>none
        <br>Snap to grid: <input type="checkbox" />
      </div>
    </div>

    <div class="toolset">
      <div class="title">Save/Export</div>
      <div class="tools">
        <a href="#" data-content="Save"><i class="fa fa-x fa-floppy-o"></i></a>
        <a href="#" data-content="Export"><i class="fa fa-x fa-hdd-o"></i></a>
        <a href="#" data-content="Load"><i class="fa fa-x fa-upload"></i></a>
      </div>
    </div>
  </div>
</div>

  <script>
  $(".tools a").popup({
    padding: "2px",
  });
  </script>

</body>
</html>