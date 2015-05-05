<div id="container">
    <div id="navigator">
      <div id="sub-navigator">
        <ul id="page-thumbs">

        </ul>
        <li class="page-thumb">
          <a href="#" class="new-page actionButton" id="AddPage" data-action="AddPage" href="#"><i class="fa fa-x fa-plus"></i></a>
        </li>
      <!--<a href="#" class="add-page-button"><i class="fa fa-x fa-plus"></i></a>/-->
      </div>
    </div>

    <div id="editor" style="overflow:scroll;">
    <p id="heading"><span id="title">Storyboarder</span> - <span id="currentPage">0</span>/<span id="numPages">0</span></p>
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
          <!--<a href="#" class="tool" id="Select" data-content="Select"><i class="fa fa-x fa-location-arrow"></i></a>/-->
          <a href="#" class="tool" id="Select" data-content="Select"><i class="icon-drawing-appbarcursordefault"></i></a>
          <!--<a href="#" class="action" id="Undo" data-content="Undo"><i class="fa fa-x fa-undo"></i></a>/-->
          <a href="#" class="actionButton" id="Undo" data-action="Undo" data-content="Undo"><i class="icon-drawing-undo"></i></a>
          <!--<a href="#" class="action" id="Redo" data-content="Redo"><i class="fa fa-x fa-repeat"></i></a>/-->
          <a href="#" class="actionButton" id="Redo" data-action="Redo" data-content="Redo"><i class="icon-drawing-redo"></i></a>
          <br>

            <input type="checkbox" class="action submenu" data-action="ToggleGrid" id="gridSnap" name="gridSnap">
            <label>Snap to grid</label><br>

            <div class="gridsnap" style="display:none">
              <div class="ui mini input">
                    <label>Spacing</label><input type="text" class="action" data-action="SetSnap" id="gridSpacing" name="gridSnap" value="40">
              </div>
            </div>

            <input type="checkbox" class="action submenu" data-action="ToggleGrid" id="panelGridSnap" name="panelGridSnap">
            <label>Snap to panel grid</label>

            <div class="panelgridsnap" style="display:none">
              <div class="ui mini input">
                    <label>Rows</label><input type="text" class="action" data-action="SetSnap" id="panelRows" name="panelGridSnap" value="3">
                    <label>Columns</label><input type="text" class="action" data-action="SetSnap" id="panelColumns" name="panelGridSnap" value="2">
              </div>
            </div>
        </div>
      </div>

      <div class="toolset">
        <div class="title">Panel</div>
        <div class="tools">
          <a href="#" class="tool" id="PanelSelect" data-content="Panel Select"><i class="icon-drawing-appbarcursordefaultoutline"></i></a>
          <!--<a href="#" class="tool" id="Split" data-content="Split"><i class="fa fa-x fa-arrows-h"></i></a>/-->
          <a href="#" class="tool" id="Split" data-content="Split"><i class="icon-drawing-tiles-plus"></i></a>
          <!--<a href="#" class="tool" id="Join" data-content="Join"><i class="fa fa-x fa-sign-in"></i></a>/-->
          <a href="#" class="tool" id="Join" data-content="Join"><i class="icon-drawing-tiles-minus"></i></a>

          <a href="#" class="tool submenu" data-content="Fill" id="Fill"><i class="fa fa-x fa-bitbucket"></i></a>
          <div class="fill" style="display:none">
              <label for="fill-color">Fill color:</label>
              <input type="color" value="#005E7A" id="fill-color"><br>
          </div>  
        </div>
      </div>

      <div class="toolset">
        <div class="title">Image</div>
        <div class="tools">
          <a href="#" id="AddImage" data-content="Add Image"><i class="icon-drawing-image"></i></a>

          <a href="#" class="tool submenu" id="Draw" data-content="Paint Brush"><i class="fa fa-x fa-paint-brush"></i></a>

          <!--<a href="#" class="tool" data-content="Eyedropper"><i class="fa fa-x fa-eyedropper"></i></a>/-->
          <div class="draw" style="display:none">
              <label for="drawing-line-width">Line width:</label>
              <input type="range" value="10" min="1" max="150" id="drawing-line-width"><br>
              <label for="drawing-color">Line color:</label>
              <input type="color" value="#005E7A" id="drawing-color"><br>
          </div>
            
        </div>
      </div>

      <div class="toolset">
        <div class="title">Text</div>
        <div class="tools">
		      <a href="#" class="tool submenu" id="Text" data-content="Add Text"><i class="icon-drawing-text-sans"></i></a>
         
          <!--<div id="None">No border</div>
          <div id="Rectangle">Rectangle</div>
          <div id="Ellipse">Ellipse</div>/-->


          <div class="text" style="display:none">  
             <select id="font-family">
                <option value="arial">Arial</option>
                <option value="comic sans ms">Comic Sans</option>
                <option value="courier">Courier</option>
                <option value="georgia">Georgia</option>
                <option value="helvetica">Helvetica</option>
                <option value="impact">Impact</option>
                <option value="myriad pro">Myriad Pro</option>
                <option value="times new roman" selected>Times New Roman</option>
                <option value="verdana">Verdana</option>
              </select><br>
              
              <!--<label for="font-size">Font size: </label><span id="fsize">10</span>
              <input type="range" value="10" min="0" max="100" id="font-size"><br>/-->
              <label for="font-color">Font color:</label>
              <input type="color" value="#000000" id="font-color"><br>
          </div>  

          <!--<br>Borders: <input type="radio" name="text-borders" id="rectangle"/> rectangle <input type="radio" name="text-borders" id="none" checked="true"/> none/-->

        </div>
      </div>

      <div class="toolset">
        <div class="title">Save/Export</div>
        <div class="tools">
          <a href="#" class="actionButton" id="Save" data-action="Save" data-content="Save"><i class="fa fa-x fa-floppy-o"></i></a>
          <a href="#" class="actionButton" id="Export" data-action="Export" data-content="Export"><i class="icon-drawing-image-export"></i></a>
          <a href="#" class="actionButton" id="Load" data-action="Load" data-content="Load"><i class="fa fa-x fa-folder-open"></i></a>
          <a href="#" class="actionButton" id="New" data-action="New" data-content="New"><i class="fa fa-x fa-file-o"></i></a>
        </div>
      </div>
    </div>
  </div>
