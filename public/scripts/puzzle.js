// Logic for the Puzzle

var grid = document.querySelector('.grid');
var pckry = new Packery( grid, {
  columnWidth: '.grid-sizer',
  itemSelector: '.tile',
  percentPosition: true,
  transitionDuration: '0.3s'
});

pckry.getItemElements().forEach( function( itemElem ) {
  var draggie = new Draggabilly( itemElem );
  pckry.bindDraggabillyEvents( draggie );
});

// map items by their data-tile
var mappedItems = {};

var dialog = document.querySelector('.dialog');

var orders = [
  'abcdefghijklm',
  // 'fmgdbalkjihec', //remove later
  'ecdibmhfajkgl',
  'ilckfgdebhjam'
];

var didWin = true;
var orderIndex = 0;

pckry.items.forEach( function( item ) {
  var attr = item.element.getAttribute('data-tile');
  mappedItems[ attr ] = item;
});

/*
 * Shuffles the tiles in the game area
 */
function shuffleTiles() {
  // shuffle items
  orderIndex++;
  var order = orders[ orderIndex % 3 ];
  pckry.items = order.split('').map( function( attr ) {
    return mappedItems[ attr ];
  });
  // stagger transition
  pckry._resetLayout();
  pckry.items.forEach( function( item, i ) {
    setTimeout( function() {
      pckry.layoutItems( [ item ] );
    }, i * 34 );
  });
}

function randomLayout() {
  console.log('ran randomLayout function');
  var orderIndex = Math.floor(Math.random() * orders.length);
  var order = orders[orderIndex];
  pckry.items = order.split('').map( function( attr ) {
    return mappedItems[ attr ];
  });
  // stagger transition
  pckry._resetLayout();
  pckry.items.forEach( function( item, i ) {
    setTimeout( function() {
      pckry.layoutItems( [ item ] );
    }, i * 34 );
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
pckry.on( 'dragItemPositioned', function() {
  var order = pckry.items.map( function( item ) {
    return item.element.getAttribute('data-tile');
  }).join('');
  if ( order === 'fmgdbalkjihce' && ( pckry.maxY === 500 || pckry.maxY === 375 )) {
    win();
  }
});

