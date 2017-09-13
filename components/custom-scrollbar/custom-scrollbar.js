/* eslint no-mixed-operators: "off", no-param-reassign: "off", radix: "off" */
/**
 * `custom-scrollbar`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
*/

class CustomScrollbar extends Polymer.mixinBehaviors(
  [Polymer.IronScrollTargetBehavior, Polymer.IronResizableBehavior],
  Polymer.Element
) {
  static get is() {
    return 'custom-scrollbar';
  }

  static get properties() {
    return {
      _heightContent: Number,
      _scrollbarHeight: Number,
      _scrollbarTop: {
        type: Number,
        value: 0,
      },
      _dragging: Object,
      _scrollbarBar: Element,
    };
  }

  _scrollHandler() {
    if (this._dragging) return;
    const visibleArea = this.scrollTarget.scrollHeight - this.scrollTarget.clientHeight;
    const scrollbarPositionPercent = this._scrollTop / visibleArea;
    this._scrollbarTop = scrollbarPositionPercent * (this._heightContent - this._scrollbarHeight);
    this.shadowRoot.querySelector('.scrollbar-bar').style.transform = `translateY(${this
      ._scrollbarTop}px)`;
  }

  ready() {
    super.ready();

    this.addEventListener('iron-resize', this._activeScrollbar);
  }

  _activeScrollbar() {
    Polymer.RenderStatus.afterNextRender(this, () => {
      this.scrollTarget = this.shadowRoot.querySelector('.scrollbar-hidden');

      this._heightContent = this.shadowRoot.querySelector('.scrollbar').offsetHeight;
      const scrollbarChild = this.shadowRoot.querySelector('.scrollbar-child');
      const visibleAreaPercent = this._heightContent * 100 / scrollbarChild.offsetHeight;
      if (this._scrollbarBar) {
        this._offDraggableEvent();
      }
      this._scrollbarBar = this.shadowRoot.querySelector('.scrollbar-bar');
      if (visibleAreaPercent < 100) {
        const scrollbarHeight = this._heightContent * visibleAreaPercent / 100;
        this._scrollbarHeight = scrollbarHeight > 20 ? scrollbarHeight : 20;
        this._scrollbarBar.style.height = `${this._scrollbarHeight}px`;
        this._draggable();
        this.shadowRoot.querySelector('.scrollbar-child').style.width = 'calc(100% - 10px)';
      } else {
        this._scrollbarBar.style.height = '0px';
        this.shadowRoot.querySelector('.scrollbar-child').style.width = '100%';
      }
    });
  }

  _offDraggableEvent() {
    this._scrollbarBar.removeEventListener('mousedown', this._mouseDownEvent.bind(this));
  }

  _draggable() {
    this._dragging = null;
    this._scrollbarBar.addEventListener('mousedown', this._mouseDownEvent.bind(this));
  }

  _mouseDownEvent(event) {
    event.preventDefault();
    this._dragging = {
      mouseY: event.clientY,
      startY: parseInt(!this._scrollbarTop ? 0 : this._scrollbarTop),
    };

    document.addEventListener('mouseup', this.endOfDrag.bind(this));
    document.addEventListener('mousemove', this.drag.bind(this));
  }

  endOfDrag() {
    this._dragging = null;
    document.removeEventListener('mouseup', this.endOfDrag);
    document.removeEventListener('mousemove', this.drag);
  }

  drag(event) {
    event.preventDefault();
    if (!this._dragging) {
      return;
    }

    const scrollbarChild = this.shadowRoot.querySelector('.scrollbar-child');

    this._scrollbarTop = this._dragging.startY + (event.clientY - this._dragging.mouseY);

    const scrollTop =
      this._scrollbarTop /
      (this._heightContent - this._scrollbarHeight) *
      (this.scrollTarget.scrollHeight - this.scrollTarget.clientHeight);

    if (scrollTop + this._heightContent >= scrollbarChild.offsetHeight) {
      return;
    }
    this._scrollbarBar.style.transform = `translateY(${Math.max(0, this._scrollbarTop)}px)`;
    this.scrollTarget.scrollTop = scrollTop;
  }
}

window.customElements.define(CustomScrollbar.is, CustomScrollbar);
