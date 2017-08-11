import {
  units,
  currentlyChosenUnit,
  assignCurrentlyChosenUnit
} from '../store/unitsStore';

import {getCanvasAngleQuater} from './unitMath';

import {ctx, WIDTH, HEIGHT} from '../config/map';

import Unit from './Unit';

// check if units was clicked by left mouse button
// x - mouse position X
// y - mouse position Y
export let chooseUnit = (units, x, y) => {
  let foundedUnit = null;
  for(let unit of units) {
    let unitX0 = unit.x;
    let unitY0 = unit.y;
    let unitX1 = unitX0 + unit.width;
    let unitY1 = unitY0 + unit.height;
    // check if coordinates is equal to unit position
    if(x >= unitX0 && x <= unitX1 && y >= unitY0 && y <= unitY1) {
      foundedUnit = unit;
      break;
    }
  }
  // if unit was found in units array
  // currentlyChosenUnit is equal to foundedUnit
  // else is unit is not founded, then
  // currentlyChosenUnit will be null
  assignCurrentlyChosenUnit(foundedUnit);
  console.log('currentlyChosenUnit', currentlyChosenUnit);
}

// change unit's moveToX, moveToY
export const assignMoveToPosition = (unit, x:number, y:number) => {
  unit.moveToX = x;
  unit.moveToY = y;
  console.log(unit.name + ' is moving to : x:' + unit.moveToX + ' y:' + unit.moveToY);
}

// draw Units in the canvas
export let setUnit = (unit) => {
    ctx.save();
    //ctx.translate(unit.x + unit.width * 0.5, unit.y + unit.height * 0.5); // translate to rectangle center
    //ctx.rotate(unit.angle);
    //ctx.fillRect(unit.x, unit.y, unit.width, unit.height);
    let img = new Image();
    //img.src = '../../img/unit.svg';
    img.src = unit.imgPath;
    img.onload = () => {
      ctx.drawImage(img, unit.x, unit.y, unit.width, unit.height);
    }
    ctx.restore();
}

// create Unit and immediatly push it into units array
export let createUnit = (name:string, centerX:number, centerY:number, width:number, height:number, speed: number, imgPath: string='../../img/unit.svg', rotationSpeed) => {
  let unit = new Unit(name, centerX, centerY, width, height, speed, imgPath, rotationSpeed);
  units.push(unit);
  setUnit(unit);
  return unit;
}

// load image
export const loadImage = (imgPath: string, callback) => {
    let img = new Image;
    img.onload = () => {
      callback(null, img);
    }
    img.onerror = () => {
      let msg = 'Cannot load the image at ' + imgPath;
      callback(new Error(msg));
    }
    img.src = imgPath;
}

// change angle depends on received data
export const changeAngle = (unit,img, changingAngle, current) => {
  return new Promise(resolve => {
    ctx.save();
    dynamiclyClearUnit(unit); // delete previos drawing unit
    ctx.translate(unit.centerX, unit.centerY); // translate to rectangle center
    let angle = changingAngle * (Math.PI / 180);
    // console.log('draw unit degree:', changingAngle);
    ctx.rotate(angle); // rotate to look straight to the destination position
    ctx.translate(-unit.centerX, -unit.centerY); // translate to rectangle center
    ctx.drawImage(img, unit.x, unit.y, unit.width, unit.height);
    ctx.restore();
    resolve();
  });
}

export const smoothlyRotateUnit = (unit) => {
  loadImage(unit.imgPath, (err, img) => { // load image, then rotate unit
    if(err) throw err;
    let {startAngle, finishAngle, rotationDirection} = chooseRotationDirection(unit);
    let changingAngle = startAngle;
    console.error('startAngle:', startAngle, 'finishAngle:', finishAngle, 'direction:', rotationDirection);
    makeRotation2(unit, img, startAngle, changingAngle, finishAngle, rotationDirection, 20);
  });
}

const makeRotation2 = (unit, img, startAngle, changingAngle, finishAngle, rotationDirection, rotationSpeed) => {
  let previous = changingAngle - rotationDirection;
  unit.setAngleToRemove(previous); // set angle that has to be removed
  if(changingAngle === finishAngle) {
      console.log('rotation finish');
      console.error('unit angle to remove', unit.angleToRemove);
      return;
  }
  else {
    if(startAngle !== changingAngle) previous = changingAngle - rotationDirection;
      unit.setAngleToRemove(previous);
      timeout(rotationSpeed, changingAngle).then(() => changeAngle(unit, img, changingAngle, finishAngle))
      .then(() => {
      makeRotation2(unit, img, startAngle, changingAngle += rotationDirection, finishAngle, rotationDirection, rotationSpeed);
    })
  }
}

export const dynamiclyClearUnit = (unit) => {
  ctx.save();
  ctx.translate(unit.centerX, unit.centerY); // translate to rectangle center
  let angle = unit.angleToRemove * (Math.PI / 180);
  // console.log('unit angle to remove:', unit.angleToRemove);
  ctx.rotate(angle); // rotate unit
  ctx.translate(-unit.centerX, -unit.centerY); // translate to rectangle center
  ctx.clearRect(unit.x, unit.y, unit.width, unit.height);
  ctx.restore();
}

// calculate path in both directions
// and decide in what direction unit has to rotate
// return startAngle, finishAngle, rotationDirection
export const chooseRotationDirection = (unit) => {
  let startQuater, finishQuater;
  let startAngle, finishAngle, rotationDirection;
  let positiveStartAngle, positiveFinishAngle;
  let negativeStartAngle, negativeFinishAngle;
  positiveStartAngle = unit.previousCanvasAngle;
  positiveFinishAngle =  unit.currentCanvasAngle;

  if(positiveStartAngle === 0) {
      negativeStartAngle = 0; // use 0 instead of 360
  }  else {
    negativeStartAngle = positiveStartAngle - 360;
  }

  if(positiveFinishAngle === 0) {
      negativeFinishAngle = 0;
  }  else {
    negativeFinishAngle = positiveFinishAngle - 360;
  }

  startQuater = getCanvasAngleQuater(positiveStartAngle);
  finishQuater = getCanvasAngleQuater(positiveFinishAngle);

  let positivePath, negativePath;
  if(startQuater === 2 || startQuater === 3) {
      negativePath = Math.abs(negativeStartAngle) + Math.abs(positiveFinishAngle);
  } else {
      negativePath = Math.abs(positiveStartAngle) + Math.abs(negativeFinishAngle);
  }
  positivePath = Math.abs(positiveFinishAngle - positiveStartAngle);

  if(positivePath <= negativePath) {
    startAngle = positiveStartAngle;
    finishAngle = positiveFinishAngle;
    if(positiveStartAngle > positiveFinishAngle) rotationDirection = -1;
    if(positiveStartAngle < positiveFinishAngle) rotationDirection = 1;
  } else { // negativePath > positivePath
    if(startQuater === 2 || startQuater === 3) {
      startAngle = negativeStartAngle;
      finishAngle = positiveFinishAngle;
      rotationDirection = 1;
    } else {
      startAngle = positiveStartAngle;
      finishAngle = negativeFinishAngle;
      rotationDirection = -1;
    }
  }
  return {
    startAngle,
    finishAngle,
    rotationDirection
  }
}

// export const clearUnit = (unit) => {
//   ctx.save();
//   ctx.translate(unit.centerX, unit.centerY); // translate to rectangle center
//   let angle = unit.previousCanvasAngle * (Math.PI / 180);
//   ctx.rotate(angle); // rotate unit
//   ctx.translate(-unit.centerX, -unit.centerY); // translate to rectangle center
//   ctx.clearRect(unit.x, unit.y, unit.width, unit.height);
//   ctx.restore();
// }

// change unit's position until it approaches to moveToPosition
export const unitsHaveToMove = () => {
  for(let unit of units) {
    if(unit.centerX !== unit.moveToX || unit.centerY !== unit.moveToY) {
      if(unit.centerX < unit.moveToX && unit.centerY < unit.moveToY) {
        unit.moveToPosition(1, 1);
      }
      else if(unit.centerX > unit.moveToX && unit.centerY > unit.moveToY) {
          unit.moveToPosition(-1, -1);
      }
      else if(unit.centerX < unit.moveToX && unit.centerY > unit.moveToY) {
        unit.moveToPosition(1, -1);
      }
      else if(unit.centerX > unit.moveToX && unit.centerY < unit.moveToY) {
        unit.moveToPosition(-1, 1);
      }
    }
    //setUnit(unit);
  }
}

// const makeRotation = (unit, img, previousAngle, changingAngle, current, rotationDirection, rotationSpeed) => {
//   if(changingAngle !== current) {
//     (function() {
//       let _changingAngle = changingAngle;
//       let previous = changingAngle;
//       if(previousAngle !== changingAngle) previous = changingAngle - rotationDirection;
//       console.error('changingAngle', _changingAngle);
//       console.error('previosAngle', previous);
//       timeout(rotationSpeed, changingAngle).then(() => changeAngle(unit, img, _changingAngle, current))
//       .then(() => {
//         makeRotation(unit, img, previousAngle, _changingAngle += rotationDirection, current, rotationDirection, rotationSpeed);
//       })
//     })()
//   }
// }

// setTimeout as a Promise
export const timeout = (time, i) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('done');
    }, time);
  })
}

// export const rotateUnit = (unit) => {
//   loadImage(unit.imgPath, (err, img) => { // load image, then rotate unit
//     if(err) throw err;
//     ctx.save();
//     clearUnit(unit); // delete previos drawing unit
//     ctx.translate(unit.centerX, unit.centerY); // translate to rectangle center
//     //let angle = (90 - unit.angleInDegree) * (Math.PI / 180);
//     let angle = unit.currentCanvasAngle * (Math.PI / 180);
//     ctx.rotate(angle); // rotate to look straight to the destination position
//     ctx.translate(-unit.centerX, -unit.centerY); // translate to rectangle center
//     ctx.drawImage(img, unit.x, unit.y, unit.width, unit.height);
//     ctx.restore();
//   });
// }
