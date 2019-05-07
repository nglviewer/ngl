/**
 * @file Selection-Box
 * @author Lily Wang <lily.wang@anu.edu.au>
 * @private
 */

import Viewer from './viewer'

export default class DragSelection {

  viewer: Viewer
  element: HTMLElement

  startPoint: {x: number, y: number};
  pointTopLeft: {x: number, y: number};
  pointBottomRight: {x: number, y: number};

  isDown: Boolean;


  constructor (viewer: Viewer) {

    this.viewer = viewer;

    this.element = document.createElement('div');

    Object.assign(this.element.style, {
        display: 'none',
        position: 'fixed',
        zIndex: '1000000',
        pointerEvents: 'none',
        border: '1px solid #55aaff',
        backgroundColor: 'rgba(75, 160, 255, 0.3)',
      })
    this.viewer.container.appendChild(this.element)

    this.startPoint = { x: 0, y: 0 };
    this.pointTopLeft = { x: 0, y: 0 };
    this.pointBottomRight = { x: 0, y: 0 };

    this.isDown = false;
  }

  createSelection (x: number, y: number) {
    console.log('creatin gsel')
    this.element.style.display = 'block';
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';
    this.element.style.width = '0px';
    this.element.style.height = '0px';

    this.startPoint.x = x;
    this.startPoint.y = y;

    this.isDown = true;
  }

  moveSelection (x: number, y: number) {
    if (!this.isDown) return;
    console.log('mv seling')

    this.pointBottomRight.x = Math.max( this.startPoint.x, x );
    this.pointBottomRight.y = Math.max( this.startPoint.y, y );
    this.pointTopLeft.x = Math.min( this.startPoint.x, x );
    this.pointTopLeft.y = Math.min( this.startPoint.y, y );

    this.element.style.left = this.pointTopLeft.x + 'px';
    this.element.style.top = this.pointTopLeft.y + 'px';
    this.element.style.width = ( this.pointBottomRight.x - this.pointTopLeft.x ) + 'px';
    this.element.style.height = ( this.pointBottomRight.y - this.pointTopLeft.y ) + 'px';
  }

  removeSelection () {
    console.log('removed')
    this.element.style.display = 'none';
    this.isDown = false;
  }

  
}