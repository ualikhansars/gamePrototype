import {ctx} from '../config/map';

class Unit {
  name: string;
  centerX: number; // center of the unit
  centerY: number;
  x: number; // initial X position
  y: number; // initial Y position
  width: number; // width of the unit
  height: number; // height of the unit
  speed: number; // speed of the unit
  moveToX: number; // next X postion
  moveToY: number; // next Y position


  constructor(name: string, centerX: number, centerY:number, width: number, height:number, speed:number) {
    this.name = name;
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
    this.x = this.centerX - (this.width / 2);
    this.y = this.centerY - (this.height / 2);
    this.speed = speed;
    this.moveToX = centerX;
    this.moveToY = centerY;
  }

  update(speedX, speedY) {
    this.centerX += speedX ;
    this.centerY += speedY;
    this.x = this.centerX - (this.width / 2); // change x and y every time when centerX and centerY is changed
    this.y = this.centerY - (this.height / 2);
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  moveToPosition(speedX, speedY) {
    if(this.centerX !== this.moveToX || this.centerY !== this.moveToY) {
         ctx.clearRect(this.x, this.y, this.width, this.height);
         this.update(speedX, speedY);
    }
    console.log(this.name + ' is on position');
  }
}

export default Unit;
