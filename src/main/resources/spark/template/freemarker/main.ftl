<!DOCTYPE html>
<html>
<head>
	<title>Storyboarder</title>
	<link rel="stylesheet/less" type="text/css" href="css/styles.less">
	<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/popup.min.css" />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/transition.min.css" />
</head>
<body>

<div id="navigator">
	<div>
		<div class="page-thumb"></div>
		<div class="page-thumb"></div>
	</div>
</div>

<div id="editor">
	<div id="pages">
		<div class="next-page">
			<i class="fa fa-2x fa-chevron-right"></i>
			<i class="fa fa-2x fa-chevron-right"></i>
		</div>
		<div class="previous-page">
			<i class="fa fa-2x fa-chevron-left"></i>
			<i class="fa fa-2x fa-chevron-left"></i>
		</div>

		<div id="page">
			Panels
		</div>
		<div id="page">
			Content
		</div>
	</div>

	<a href="#" class="add-page-button"><i class="fa fa-3x fa-plus"></i></a>
</div>

<div id="toolbar">
	<div class="title">Toolbar</div>

	<div class="toolset">
		<div class="title">Main</div>
		<div class="tools">
			<a href="#" data-content="Select"><i class="fa fa-2x fa-location-arrow"></i></a>
			<a href="#" data-content="Undo"><i class="fa fa-2x fa-undo"></i></a>
			<a href="#" data-content="Redo"><i class="fa fa-2x fa-repeat"></i></a>
		</div>
	</div>

	<div class="toolset">
		<div class="title">Panel</div>
		<div class="tools">
			<a href="#" class="split" data-content="Split"><i class="fa fa-2x fa-arrows-h"></i></a>
			<a href="#" data-content="Join"><i class="fa fa-2x fa-sign-in"></i></a>
		</div>
	</div>

	<div class="toolset">
		<div class="title">Image</div>
		<div class="tools">
			<a href="#" data-content="Add Image"><i class="fa fa-2x fa-plus-circle"></i></a>
			<a href="#" data-content="Paint Brush"><i class="fa fa-2x fa-paint-brush"></i></a>
			<a href="#" data-content="Fill"><i class="fa fa-2x fa-bitbucket"></i></a>
			<a href="#" data-content="Eyedropper"><i class="fa fa-2x fa-eyedropper"></i></a>
		</div>
	</div>

	<div class="toolset">
		<div class="title">Text</div>
		<div class="tools">
			<a href="#" data-content="Add Text"><i class="fa fa-2x fa-plus-circle"></i></a>
		</div>
	</div>

	<div class="toolset">
		<div class="title">Save/Export</div>
		<div class="tools">
			<a href="#" data-content="Save"><i class="fa fa-2x fa-floppy-o"></i></a>
			<a href="#" data-content="Export"><i class="fa fa-2x fa-hdd-o"></i></a>
			<a href="#" data-content="Load"><i class="fa fa-2x fa-upload"></i></a>
		</div>
	</div>
</div>

<!-- page panels module -->
<!-- painter module -->
<!-- ui module -->
<!-- server module -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/less.js/2.4.0/less.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/popup.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/1.10.3/components/transition.min.js"></script>
<script>
$(".tools a").popup({
	position: "left center"
});
</script>

</body>
</html>