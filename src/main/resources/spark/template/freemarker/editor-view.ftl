<div id="container">
    <div id="navigator">
      <div>
        <div class="page-thumb">
          <a class="page-thumb" href="#"> </a>
          <a href="#" class="remove-page"><i class="fa fa-x fa-remove"></i></a>
        </div>
        <div class="page-thumb">
          <a class="page-thumb" href="#"> </a>
          <a href="#" class="remove-page"><i class="fa fa-x fa-remove"></i></a>
        </div>
        <div class="page-thumb">
          <a class="page-thumb" href="#"> </a>
          <a href="#" class="new-page"><i class="fa fa-x fa-plus"></i></a>
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
          <a href="#" class="tool" id="Select" data-content="Select"><i class="fa fa-x fa-location-arrow"></i></a>
          <a href="#" class="action" id="Undo" data-content="Undo"><i class="fa fa-x fa-undo"></i></a>
          <a href="#" class="action" id="Redo" data-content="Redo"><i class="fa fa-x fa-repeat"></i></a>
          <br>
                <div class="ui checkbox">
                  <input type="checkbox" class="action" name="ToggleGrid" id="ToggleGrid">
                  <label>Snap to grid</label>
            </div>

            <div class="ui mini input">
                  <label>Spacing</label><input type="text" class="action" id="GridSpacing" value="20">
            </div>
        </div>
      </div>

      <div class="toolset">
        <div class="title">Panel</div>
        <div class="tools">
          <a href="#" class="tool" id="Split" data-content="Split"><i class="fa fa-x fa-arrows-h"></i></a>
          <a href="#" class="tool" id="Join" data-content="Join"><i class="fa fa-x fa-sign-in"></i></a>
        </div>
      </div>

      <div class="toolset">
        <div class="title">Image</div>
        <div class="tools">
          <a href="#" class="modal" id="Add Image" data-content="Add Image"><i class="fa fa-x fa-plus-circle"></i></a>
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

          <a href="#" class="tool" data-content="Paint Brush"><i class="fa fa-x fa-paint-brush"></i></a>
          <a href="#" class="tool" data-content="Fill"><i class="fa fa-x fa-bitbucket"></i></a>
          <a href="#" class="tool" data-content="Eyedropper"><i class="fa fa-x fa-eyedropper"></i></a>
        </div>
      </div>

      <div class="toolset">
        <div class="title">Text</div>
        <div class="tools">
          <a href="#" class="tool" id="Text" data-content="Add Text"><i class="fa fa-x fa-plus-circle"></i></a>
          <br>Borders: <input type="radio" name="text-borders"/>ellipse <input type="radio" name="text-borders"/>rectangle <input type="radio" name="text-borders" checked="true"/>none
        </div>
      </div>

      <div class="toolset">
        <div class="title">Save/Export</div>
        <div class="tools">
          <a href="#" class="modal" id="Save" data-content="Save"><i class="fa fa-x fa-floppy-o"></i></a>
          <a href="#" class="modal" id="Export" data-content="Export"><i class="fa fa-x fa-hdd-o"></i></a>
          <a href="#" class="modal" id="Load" data-content="Load"><i class="fa fa-x fa-upload"></i></a>
        </div>
      </div>
    </div>
  </div>
