var oldMouseStart = $.ui.draggable.prototype._mouseStart;

$.ui.draggable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
  this._trigger("beforeStart", event, this._uiHash());
  oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
};

