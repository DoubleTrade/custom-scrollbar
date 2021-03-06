/*

[![Build status](https://travis-ci.org/DoubleTrade/custom-scrollbar.svg?branch=master)](https://travis-ci.org/DoubleTrade/custom-scrollbar)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/doubletrade/range-datepicker)

## &lt;custom-scrollbar&gt;

`custom-scrollbar` provides a simple custom scrollbar for a container.

### Install

    bower install custom-scrollbar

### Styling

`<custom-scrollbar>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--custom-scrollbar-height` | Height of the content | 200px
`--custom-scrollbar-bar` | Customize the bar | `{}`
`--custom-scrollbar-bar-track-hover` | Customize the bar when track is under cursor | `{}`
`--custom-scrollbar-bar-container-hover` | Customize the bar when container is under cursor | `{}`
`--custom-scrollbar-track` | Customize the track | `{}`
`--custom-scrollbar-track-hover` | Customize the track under cursor | `{}`
`--custom-scrollbar-track-container-hover` | Customize the track when container is under cursor | `{}`
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { IronScrollTargetBehavior } from '@polymer/iron-scroll-target-behavior/iron-scroll-target-behavior.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
/* eslint no-mixed-operators: "off", no-param-reassign: "off", radix: "off" */
/**
 * `custom-scrollbar`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
*/

class CustomScrollbar extends mixinBehaviors(
  [IronScrollTargetBehavior, IronResizableBehavior],
  PolymerElement
) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        overflow: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      .scrollbar {
        position: relative;
        height: var(--custom-scrollbar-height, 200px);
      }

      .scrollbar-hidden {
        overflow-y: scroll;
        overflow-x: hidden;
        outline: none;
        position: absolute;
        top: 0;
        left: 0;
        right: -20px;
        bottom: 0;
        @apply --custom-scrollbar-hidden;
      }

      .scrollbar-track {
        position: absolute;
        right: 2px;
        top: 0;
        bottom: 0;
        width: 8px;
        overflow: hidden;
        @apply --custom-scrollbar-track;
      }

      .scrollbar-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        border-radius: 4px;
        cursor: default;
        outline: none;
        z-index: 1;
        opacity: 0.45;
        transform: translateY(0);
        background-color: black;
        transition: height 0.2s;
        @apply --custom-scrollbar-bar;
      }

      .scrollbar-static {
        transition: width 0.2s;
      }

      .scrollbar-track:hover {
        @apply --custom-scrollbar-track-hover;
      }

      .scrollbar-track:hover .scrollbar-bar {
        @apply --custom-scrollbar-bar-track-hover;
      }

      .scrollbar:hover .scrollbar-track {
        @apply --custom-scrollbar-track-container-hover;
      }

      .scrollbar:hover .scrollbar-bar {
        @apply --custom-scrollbar-bar-container-hover;
      }
    </style>

    <div class="scrollbar">
      <div class="scrollbar-hidden">
        <div class="scrollbar-child">
          <div class="scrollbar-static">
            <slot></slot>
          </div>
        </div>
      </div>
      <div class="scrollbar-track">
        <div class="scrollbar-bar"></div>
      </div>
    </div>
`;
  }

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
      displayOnlyOnMouseOver: {
        type: Boolean,
        value: false,
      },
      _mouseover: {
        type: Boolean,
        value: false,
      },
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
    this.addEventListener('mouseover', this._handleMouseOver.bind(this));
    this.addEventListener('mouseout', this._handleMouseOut.bind(this));
  }

  _activeScrollbar() {
    afterNextRender(this, () => {
      this.scrollTarget = this.shadowRoot.querySelector('.scrollbar-hidden');

      this._heightContent = this.shadowRoot.querySelector('.scrollbar').offsetHeight;
      const scrollbarChild = this.shadowRoot.querySelector('.scrollbar-child');
      const visibleAreaPercent = this._heightContent * 100 / scrollbarChild.offsetHeight;
      if (this._scrollbarBar) {
        this._offDraggableEvent();
      }
      this._scrollbarBar = this.shadowRoot.querySelector('.scrollbar-bar');
      if (
        visibleAreaPercent < 100 &&
        (!this.displayOnlyOnMouseOver || (this.displayOnlyOnMouseOver && this._mouseover))
      ) {
        const scrollbarHeight = this._heightContent * visibleAreaPercent / 100;
        this._scrollbarHeight = scrollbarHeight > 20 ? scrollbarHeight : 20;
        this._scrollbarBar.style.height = `${this._scrollbarHeight}px`;
        this._draggable();
        this.shadowRoot.querySelector('.scrollbar-static').style.width = `${this.offsetWidth -
          10}px`;
      } else {
        this._scrollbarBar.style.height = '0px';
        this.shadowRoot.querySelector('.scrollbar-static').style.width = `${this.offsetWidth}px`;
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

  _handleMouseOver(event) {
    event.preventDefault();
    if (!this._mouseover && !this._dragging) {
      this._mouseover = true;
      this._activeScrollbar();
    }
  }

  _handleMouseOut(event) {
    event.preventDefault();
    if (this._mouseover && !this._dragging) {
      this._mouseover = false;
      this._activeScrollbar();
    }
  }
}

window.customElements.define(CustomScrollbar.is, CustomScrollbar);
