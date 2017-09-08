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
  [Polymer.IronScrollTargetBehavior],
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

    Polymer.Async.microTask.run(() => {
      this.scrollTarget = this.shadowRoot.querySelector('.scrollbar-hidden');

      this._heightContent = this.shadowRoot.querySelector('.scrollbar').offsetHeight;
      const scrollbarChild = this.shadowRoot.querySelector('.scrollbar-child');
      const visibleAreaPercent = this._heightContent * 100 / scrollbarChild.offsetHeight;
      const scrollbarHeight = this._heightContent * visibleAreaPercent / 100;
      this._scrollbarHeight = scrollbarHeight > 20 ? scrollbarHeight : 20;
      this._scrollbarBar = this.shadowRoot.querySelector('.scrollbar-bar');
      this._scrollbarBar.style.height = `${this._scrollbarHeight}px`;
      this._draggable();
    });
  }

  _draggable() {
    this._dragging = null;

    this._scrollbarBar.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this._dragging = {
        mouseY: event.clientY,
        startY: parseInt(!this._scrollbarTop ? 0 : this._scrollbarTop),
      };

      document.addEventListener('mouseup', this.endOfDrag.bind(this));
      document.addEventListener('mousemove', this.drag.bind(this));
    });
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
