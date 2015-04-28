<div id="container">
    <div id="navigator">
      <div id="sub-navigator">
        <div id="page-thumbs">
        </div>
        <div class="page-thumb">
          <a href="#" class="new-page view" id="AddPage" href="#"><i class="fa fa-x fa-plus"></i></a>
        </div>
      <!--<a href="#" class="add-page-button"><i class="fa fa-x fa-plus"></i></a>/-->
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
          <!--<a href="#" class="tool" id="Select" data-content="Select"><i class="fa fa-x fa-location-arrow"></i></a>/-->
          <a href="#" class="tool" id="Select" data-content="Select"><i class="icon-drawing-appbarcursordefault"></i></a>
          <!--<a href="#" class="action" id="Undo" data-content="Undo"><i class="fa fa-x fa-undo"></i></a>/-->
          <a href="#" class="action" id="Undo" data-action="Undo" data-content="Undo"><i class="icon-drawing-undo"></i></a>
          <!--<a href="#" class="action" id="Redo" data-content="Redo"><i class="fa fa-x fa-repeat"></i></a>/-->
          <a href="#" class="action" id="Redo" data-action="Redo" data-content="Redo"><i class="icon-drawing-redo"></i></a>
          <br>
            <div class="ui checkbox">
                  <input type="checkbox" class="action submenu" data-action="ToggleGrid" id="gridSnap" name="gridSnap">
                  <label>Snap to grid</label>
            </div>
            <div class="gridsnap" style="display:none">
              <div class="ui mini input">
                    <label>Spacing</label><input type="text" class="action" data-action="SetSnap" id="gridSpacing" name="gridSnap" value="40">
              </div>
            </div>
            <div class="ui checkbox">
                  <input type="checkbox" class="action submenu" data-action="ToggleGrid" id="panelGridSnap" name="panelGridSnap">
                  <label>Snap to panel grid</label>
            </div>
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
          <!--<a href="#" class="tool" id="Split" data-content="Split"><i class="fa fa-x fa-arrows-h"></i></a>/-->
          <a href="#" class="tool" id="Split" data-content="Split"><i class="icon-drawing-tiles-plus"></i></a>
          <!--<a href="#" class="tool" id="Join" data-content="Join"><i class="fa fa-x fa-sign-in"></i></a>/-->
          <a href="#" class="tool" id="Join" data-content="Join"><i class="icon-drawing-tiles-minus"></i></a>
        </div>
      </div>

      <div class="toolset">
        <div class="title">Image</div>
        <div class="tools">
          <a href="#" class="view" id="AddImage" data-content="AddImage"><i class="icon-drawing-image"></i></a>
          <div style="display: none;" id="drawing-mode-options">
            <label for="drawing-mode-selector">Mode:</label>
            <select id="drawing-mode-selector">
              <option>Pencil</option>
              <option>Circle</option>
              <option>Spray</option>
              <option>Pattern</option>
              <option>hline</option>
              <option>vline</option>
              <option>square</option>
              <option>diamond</option>
              <option>texture</option>
            </select><br>
            <label for="drawing-line-width">Line width:</label>
            <input type="range" value="30" min="0" max="150" id="drawing-line-width"><br>
            <label for="drawing-color">Line color:</label>
            <input type="color" value="#005E7A" id="drawing-color"><br>
            <label for="drawing-shadow-width">Line shadow width:</label>
            <input type="range" value="0" min="0" max="50" id="drawing-shadow-width"><br>
          </div>

          <a href="#" class="tool submenu" id="Draw" data-content="Paint Brush"><i class="fa fa-x fa-paint-brush"></i></a>
          <a href="#" class="tool" data-content="Fill"><i class="fa fa-x fa-bitbucket"></i></a>
          <a href="#" class="tool" data-content="Eyedropper"><i class="fa fa-x fa-eyedropper"></i></a>
           <div class="draw" style="display:none">
                <a href="#" class="item" id="eraser" data-content="Eraser">Eraser</a>

              <label for="drawing-line-width">Line width:</label>
              <input type="range" value="10" min="0" max="150" id="drawing-line-width"><br>
              <label for="drawing-color">Line color:</label>
              <input type="color" value="#005E7A" id="drawing-color"><br>
          </div>  
        </div>
      </div>

      <div class="toolset">
        <div class="title">Text</div>
        <div class="tools">

          <a href="#" class="tool" id="Text" data-content="Add Text"><i class="icon-drawing-text-sans"></i></a>
          <br>Borders:
            <a href="#" class="option" data-option="" id="BorderRectangle"><i class="fa fa-x fa-square-o"></i></a>
            <a href="#" class="option" data-option="" id="BorderCircle"><i class="fa fa-x fa-circle-thin"></i></a>
            <a href="#" class="option selected" data-option="" id="BorderNone"><i class="fa fa-x fa-ban"></i></a>
        </div>
      </div>

      <div class="toolset">
        <div class="title">Save/Export</div>
        <div class="tools">
          <a href="#" class="view" id="New" data-content="New"><i class="fa fa-x fa-file-o"></i></a>
          <a href="#" class="view" id="Load" data-content="Load"><i class="fa fa-x fa-folder-open"></i></a>
          <a href="#" class="view" id="Save" data-content="Save"><i class="fa fa-x fa-floppy-o"></i></a>
          <a href="#" class="view" id="Export" data-content="Export"><i class="icon-drawing-image-export"></i></a>
        </div>
      </div>
    </div>
  </div>
