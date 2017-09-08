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

    this.scrollTarget = this.shadowRoot.querySelector('.scrollbar-hidden');

    this._heightContent = this.shadowRoot.querySelector('.scrollbar').offsetHeight;
    const scrollbarChild = this.shadowRoot.querySelector('.scrollbar-child');
    const visibleAreaPercent = this._heightContent * 100 / scrollbarChild.offsetHeight;
    const scrollbarHeight = this._heightContent * visibleAreaPercent / 100;
    this._scrollbarHeight = scrollbarHeight > 20 ? scrollbarHeight : 20;
    this.shadowRoot.querySelector('.scrollbar-bar').style.height = `${this._scrollbarHeight}px`;

    const scrollbarBar = this.shadowRoot.querySelector('.scrollbar-bar');

    this._draggable(scrollbarBar);
  }

  _draggable(element) {
    this._dragging = null;

    element.addEventListener('mousedown', (event) => {
      this._dragging = {
        mouseY: event.clientY,
        startY: parseInt(!this._scrollbarTop ? 0 : this._scrollbarTop),
      };
      if (element.setCapture) element.setCapture();
    });

    element.addEventListener('losecapture', () => {
      this._dragging = null;
    });

    document.addEventListener(
      'mouseup',
      () => {
        this._dragging = null;
      },
      true
    );

    const dragTarget = element.setCapture ? element : document;

    dragTarget.addEventListener(
      'mousemove',
      (event) => {
        if (this._dragging) {
          event.preventDefault();
        } else {
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
        element.style.transform = `translateY(${Math.max(0, this._scrollbarTop)}px)`;
        this.scrollTarget.scrollTop = scrollTop;
      },
      true
    );
  }
}

window.customElements.define(CustomScrollbar.is, CustomScrollbar);
