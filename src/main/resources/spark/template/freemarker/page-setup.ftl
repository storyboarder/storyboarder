<div class="ui standard modal page-setup">

<div class="header">
  Project Setup
</div>

<div class="content">

  <div class="ui two column divided grid">

    <div class="column">
      <h2 class="ui header">Create</h2>
      <div class="ui form" class="CreateProject">
        <div class="two fields">
          <div class="ui right labeled field">
            <label>Page Width</label>
            <div class="ui right labeled input">
              <input type="text" id="page-width" placeholder="" value="400">
              <div class="ui label">
                px
              </div>
            </div>
          </div>
          <div class="ui right labeled field">
            <label>Page Height</label>
            <div class="ui right labeled input">
              <input type="text" id="page-height" placeholder="" value="600">
              <div class="ui label">
                px
              </div>
            </div>
          </div>
        </div>

        <div class="two fields">
          <div class="ui right labeled field">
            <label>Page Margin</label>
            <div class="ui right labeled input">
              <input type="text" id="page-margin" placeholder="" value="10">
              <div class="ui label">
                px
              </div>
            </div>
          </div>
          <div class="ui right labeled field">
            <label>Panel Margin</label>
            <div class="ui right labeled input">
              <input type="text" id="panel-margin" placeholder="" value="5">
              <div class="ui label">
                px
              </div>
            </div>
          </div>
        </div>

        <div class="ui button form-action" id="CreateProject">
          Create
        </div>

      </div>
    </div>
    <div class="column" style="height:100%">
      <h2 class="ui header">Load</h2>
      <div class="ui form" class="LoadProject">
        <div id="project-choices" class="ui divided list">
        </div>
      </div>
    </div>
  </div>

</div>

</div>

<div class="ui dimmer">
</div>
