define(["CanvasState"], function(canvasState) {

  var getWidth = function(options) {
    return options.target.width*options.target.scaleX;
  };

  var getHeight = function(options) {
    return options.target.height*options.target.scaleY;
  };

  return {
    /* Snap functions */
    edge: function(dist, snapFunction) {
      return {
        type: "edge",
        dist: dist,
        snap: snapFunction
      }
    },

    corner: function(dist, snapFunction) {
      return {
        type: "corner",
        dist: dist,
        snap: snapFunction
      }
    },

    getDist: function(pos) {
      var mod = pos % canvasState.getGridSpacing();
      return Math.min(mod, canvasState.getGridSpacing() - mod);
    },

    getLeft: function(options) {
      return options.target.left;
    },

    getRight: function(options) {
      return options.target.left + getWidth(options);
    },

    getTop: function(options) {
      return options.target.top;
    },

    getBottom: function(options) {
      return options.target.top + getHeight(options);
    },

    setLeft: function(options, newLeft) {
      options.target.set({
        left: newLeft
      });
    },

    setRight: function(options, newRight) {
      options.target.set({
        left: newRight - getWidth(options)
      });
    },

    setRightPreserveLeft: function(options, newRight) {
      obj = options.target;
      obj.set({
        scaleX: (newRight - obj.left)/obj.width
      });
    },

    setTop: function(options, newTop) {
      options.target.set({
        top: newTop
      });
    },

    setBottom: function(options, newBottom) {
      options.target.set({
        top: newBottom - getHeight(options)
      });
    },

    setBottomPreserveTop: function(options, newBottom) {
      obj = options.target;
      obj.set({
        scaleY: (newBottom - obj.top)/obj.height
      });
    },

    snap: function(value) {
      var spacing = canvasState.getGridSpacing();
      var tol = canvasState.getSnapDistance();
      dif = value % spacing;
      if (dif < tol) {
        return value - dif;
      } else if (spacing - dif < tol) {
        return value + spacing - dif;
      } else {
        return value;
      }
    },
  }
});