// Logic for the Puzzle

const grid = document.querySelector('.grid');
const pckry = new Packery(grid, {
  columnWidth: '.grid-sizer',
  itemSelector: '.tile',
  percentPosition: true,
  transitionDuration: '0.3s'
});

pckry.getItemElements().forEach(function(itemElem) {
  const draggie = new Draggabilly(itemElem);
  pckry.bindDraggabillyEvents(draggie);
});

// map items by their data-tile
const mappedItems = {};

const dialog = document.querySelector('.dialog');

const orders = [
  'abcdefghijklm',
  'ecdibmhfajkgl',
  'ilckfgdebhjam'
];

let didWin = true;
let orderIndex = 0;

pckry.items.forEach(function(item) {
  const attr = item.element.getAttribute('data-tile');
  mappedItems[attr] = item;
});

/*
 * Shuffles the tiles in the game area
 */
function shuffleTiles() {
  // shuffle items
  orderIndex++;
  const order = orders[orderIndex % 3];
  pckry.items = order.split('').map(function(attr) {
    return mappedItems[attr];
  });
  // stagger transition
  pckry._resetLayout();
  pckry.items.forEach(function(item, i) {
    setTimeout(function() {
      pckry.layoutItems([item]);
    }, i * 34);
  });
}

function randomLayout() {
  const orderIndex = Math.floor(Math.random() * orders.length);
  const order = orders[orderIndex];
  pckry.items = order.split('').map(function(attr) {
    return mappedItems[attr];
  });
  // stagger transition
  pckry._resetLayout();
  pckry.items.forEach(function(item, i) {
    setTimeout(function() {
      pckry.layoutItems([item]);
    }, i * 34);
  });
}

/*
 * Loads the dialog box
 */
function showDialog() {
  dialog.classList.remove('is-waiting');
}

/*
 * Checks when a div is moved if the puzzle is correctly conpleted
 * If yes, loads the win function
 *500 for large screen 375 for small
 */
pckry.on('dragItemPositioned', function() {
  const order = pckry.items.map(function(item) {
    return item.element.getAttribute('data-tile');
  }).join('');
  if (order === 'fmgdbalkjihce' && (pckry.maxY === 500 || pckry.maxY === 375)) {
    win();
  }
});

