'use strict';

const ctxt = canvas.getContext('2d');

let topMargin = 50;
let leftMargin = 50;
let rightMargin = 100;
let lineHeight = 24;

class Letter {
  constructor(prev, value, next = null) {
    this.x = Math.floor(Math.random() * innerWidth);
    this.y = Math.floor(Math.random() * innerHeight);
    this.value = value;
    ctxt.font = '14pt Avenir';
    this.width = ctxt.measureText(this.value).width;
    this.prev = prev;
    this.next = next;
  }

  computeDeltas() {
    let desiredX;
    let desiredY;
    if (this.prev === null) {
      desiredX = leftMargin;
      desiredY = topMargin;
    } else if (this.value === ' ') {
      desiredX = this.prev.x + this.prev.width;
      desiredY = this.prev.y;
    } else if (
        this.prev.value !== ' ' ||
        this.fitsStartingAt(this.prev.x + this.prev.width)) {
      desiredX = this.prev.x + this.prev.width;
      desiredY = this.prev.y;
    } else {
      desiredX = leftMargin;
      desiredY = this.prev.y + lineHeight;
    }

    this.deltaX = (desiredX - this.x) / 2;
    this.deltaY = (desiredY - this.y) / 2;
  }

  applyDeltas() {
    this.x += this.deltaX;
    this.y += this.deltaY;
  }

  fitsStartingAt(x) {
    if (this.value === ' ') {
      return true;
    } else {
      return x + this.width < innerWidth - rightMargin &&
          (this.next === null || this.next.fitsStartingAt(x + this.width));
    }
  }

  draw(t) {
    ctxt.fillStyle = 'black';
    ctxt.font = '14pt Avenir';
    ctxt.fillText(this.value, this.x, this.y);
    if (this === letterAfterCursor && Math.floor(t / 30) % 2 === 0) {
      ctxt.fillStyle = 'cornflowerblue';
      ctxt.fillRect(this.x, this.y - lineHeight + 4, 3, lineHeight);
    }
  }

  containsPoint(x, y) {
    return this.x <= x && x < this.x + this.width &&
        this.y - lineHeight <= y && y < this.y;
  }
}

const text = 'There was me, that is Alex, and my three droogs, that is Pete, Georgie, and Dim, and we sat in the Korova Milkbar trying to make up our rassoodocks what to do with the evening. The Korova Milk Bar sold milkplus, milk plus vellocet or synthemesc or drencrom which is what we were drinking. This would sharpen you up and make you ready for a bit of the old ultra-violence. Our pockets were full of money so there was no need on that score, but, as they say, money isn\'t everything.';

let firstLetter = null;
let lastLetter = null;
for (const c of text) {
  const currLetter = new Letter(lastLetter, c);
  if (firstLetter === null) {
    firstLetter = currLetter;
  }
  if (lastLetter !== null) {
    lastLetter.next = currLetter;
  }
  lastLetter = currLetter;
}

let t = 0;

function main() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  ctxt.strokeStyle = '#efefef';
  ctxt.strokeRect(
      leftMargin,
      topMargin - lineHeight,
      innerWidth - leftMargin - rightMargin,
      innerHeight);

  let currLetter = firstLetter;
  while (currLetter !== null) {
    currLetter.computeDeltas();
    currLetter = currLetter.next;
  }

  currLetter = firstLetter;
  while (currLetter !== null) {
    currLetter.applyDeltas();
    currLetter.draw(t);
    currLetter = currLetter.next;
  }

  t++;
  requestAnimationFrame(main);
}

let letterAfterCursor = null;

document.body.onmousedown = e => {
  letterAfterCursor = null;
  let currLetter = firstLetter;
  while (letterAfterCursor === null && currLetter !== null) {
    if (currLetter.containsPoint(e.offsetX, e.offsetY)) {
      letterAfterCursor = currLetter;
    }
    currLetter = currLetter.next;
  }
};

document.body.onkeypress = e => {
  if (letterAfterCursor != null) {
    const newLetter = new Letter(letterAfterCursor.prev, e.key, letterAfterCursor);
    newLetter.x = letterAfterCursor.x;
    newLetter.y = letterAfterCursor.y;
    if (letterAfterCursor.prev === null) {
      firstLetter = newLetter;
    } else {
      letterAfterCursor.prev.next = newLetter;
    }
    letterAfterCursor.prev = newLetter;
  }
};

document.body.onkeydown = e => {
  if (e.key === 'Backspace' && letterAfterCursor !== null && letterAfterCursor.prev !== null) {
    letterAfterCursor.prev = letterAfterCursor.prev.prev;
    if (letterAfterCursor.prev === null) {
      firstLetter = letterAfterCursor;
    } else {
      letterAfterCursor.prev.next = letterAfterCursor;
    }
  }
};

main();

