let c: any = document.getElementById("canvas");
let ctx = c.getContext("2d");

// import units from store
import {
  units,
  currentlyChosenUnit,
  assignCurrentlyChosenUnit
} from './store/unitStore';

// global variables
const WIDTH: number = 1000;
const HEIGHT: number = 560;

let chosenUnit;

class Unit {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  spdX: number;
  spdY: number;

  constructor(name: string, x: number, y:number, width: number, height:number, spdX:number, spdY:number) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.spdX = spdX;
    this.spdY = spdY;
  }
}

// create Unit and immediatly push it into units array
let createUnit = (name, x, y, width, height, spdX, spdY) => {
  let unit = new Unit(name, x, y, width, height, spdX, spdY);
  units.push(unit);
  return unit;
}

let infantry = createUnit('Infantry',0, 0, 100, 50, 5, 7);
let cavalry = createUnit('Cavalry', 100, 80, 50, 60, 12, 20);


let chooseUnit = (units, x, y) => {
  for(let unit of units) {
    let unitX0 = unit.x;
    let unitY0 = unit.y;
    let unitX1 = unitX0 + unit.width;
    let unitY1 = unitY0 + unit.height;
    // check if coordinates is equal to unit position
    if(x >= unitX0 && x <= unitX1 && y >= unitY0 && y <= unitY1) {
      console.error(unit.name, 'was clicked');
      assignCurrentlyChosenUnit(unit);
      console.log('currentlyChosenUnit', currentlyChosenUnit);
    } else {
      console.log('No unit was clicked');
    }
  }
}


let setUnit = (unit) => {
    ctx.fillRect(unit.x, unit.y, unit.width, unit.height);
}

setUnit(infantry);
setUnit(cavalry);

// set onClickListener for left mouse event to canvas element
c.addEventListener('click', (e) => {
  let x = e.offsetX; // get X
  let y = e.offsetY; // get Y
  console.log('Position x', e.offsetX); // get X
  console.log('Position y', e.offsetY); // get Y
  chooseUnit(units, x, y);
});

// set onClickListener for right mouse event
c.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  let x = e.offsetX; // get X
  let y = e.offsetY; // get Y
  console.log('go to x: ' + x + ' y: ' + y);
});
