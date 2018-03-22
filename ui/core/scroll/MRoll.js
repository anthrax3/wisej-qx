/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin holding the handler for roll event. Please
 * keep in mind that the including widget has to have the scroll bars
 * implemented as child controls named <code>scrollbar-x</code> and
 * <code>scrollbar-y</code> to get the handler working. Also, you have to
 * attach the listener yourself.
 */
qx.Mixin.define("qx.ui.core.scroll.MRoll",
{
  members :
  {
    // @ITG:Wisej: Not needed, saving the pointer id is pointless since it changes on each impulse roll.
    // __cancelRoll: null,

    /**
     * Responsible for adding the event listener needed for scroll handling.
     */
    _addRollHandling : function() {
      this.addListener("roll", this._onRoll, this);
      // @ITG:Wisej: Added to stop momentum scrolling on a single tap.
      this.addListener("tap", this._onPointerTap, this);
      // @ITG:Wisej: Not needed, saving the pointer id is pointless since it changes on each impulse roll.
      // this.addListener("pointerdown", this._onPointerDownForRoll, this);
    },


    /**
     * Responsible for removing the event listener needed for scroll handling.
     */
    _removeRollHandling : function() {
      this.removeListener("roll", this._onRoll, this);
      // @ITG:Wisej: Added to stop momentum scrolling on a single tap.
      this.removeListener("tap", this._onPointerTap, this);
      // @ITG:Wisej: Not needed, saving the pointer id is pointless since it changes on each impulse roll.
      // this.removeListener("pointerdown", this._onPointerDownForRoll, this);
    },

    // @ITG:Wisej: Cancel scroll momentum on a single tap.
    /**
     * Handler for the tap event, used to cancel momentum scrolling.
     */
    _onPointerTap: function (e) {
      this.__stopMomentum = true;
    },

    /**
     * Roll event handler
     *
     * @param e {qx.event.type.Roll} Roll event
     */
    _onRoll : function(e)
    {
      // only wheel and touch
      if (e.getPointerType() == "mouse") {
        return;
      }

      // @ITG:Wisej: Let mobile users keep rolling and accelerating and cancel momentum scrolling
      // only on a single tap, see the onPointerTap handler.

      if (!e.getMomentum())
        this.__stopMomentum = false;

      if (this.__stopMomentum && e.getMomentum()) {
        qx.event.Registration.getManager(e.getOriginalTarget())
          .getHandler(qx.event.handler.Gesture)
          .gestureCancel(e.getPointerId());

        e.stopMomentum();
        return;
      }
      // @ITG:Wisej: Not needed, saving the pointer id is pointless since it changes on each impulse roll.
      this.__cancelRoll = null;

      var showX = this._isChildControlVisible("scrollbar-x");
      var showY = this._isChildControlVisible("scrollbar-y");

      var scrollbarY = showY ? this.getChildControl("scrollbar-y", true) : null;
      var scrollbarX = showX ? this.getChildControl("scrollbar-x", true) : null;

      var deltaY = e.getDelta().y;
      var deltaX = e.getDelta().x;

      var endY = !showY;
      var endX = !showX;

      // y case
      if (scrollbarY) {
        if (deltaY !== 0) {
          scrollbarY.scrollBy(parseInt(deltaY, 10));
        }

        var position = scrollbarY.getPosition();
        var max = scrollbarY.getMaximum();

        // pass the event to the parent if the scrollbar is at an edge
        if (deltaY < 0 && position <= 0 || deltaY > 0 && position >= max) {
          endY = true;
        }
      }

      // x case
      if (scrollbarX) {
        if (deltaX !== 0) {
          scrollbarX.scrollBy(parseInt(deltaX, 10));
        }

        var position = scrollbarX.getPosition();
        var max = scrollbarX.getMaximum();
        // pass the event to the parent if the scrollbar is at an edge
        if (deltaX < 0 && position <= 0 || deltaX > 0 && position >= max) {
          endX = true;
        }
      }

      // @ITG:Wisej: Don't stop the momentum when "rolling" on a scrollable widget
      // without scrollbars, it may be a child of a scrollable panel.
      //if (endX && endY) {
      //  e.stopMomentum();
      //}

      // pass the event to the parent if both scrollbars are at the end
      if ((!endY && deltaX === 0) ||
          (!endX && deltaY === 0) ||
          ((!endX || !endY ) && deltaX !== 0 && deltaY !== 0)) {
        // Stop bubbling and native event only if a scrollbar is visible
        e.stop();
      }
    }
  }
});
