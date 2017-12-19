var grid = document.querySelector('.grid');
var pckry = new Packery( grid, {
  itemSelector: '.tile',
  columnWidth: 100,
  transitionDuration: '0.3s'
});

pckry.getItemElements().forEach( function( itemElem ) {
  var draggie = new Draggabilly( itemElem );
  pckry.bindDraggabillyEvents( draggie );
});

// map items by their data-tile
var mappedItems = {};

pckry.items.forEach( function( item ) {
  var attr = item.element.getAttribute('data-tile');
  mappedItems[ attr ] = item;
});

( function() {

var orders = [
  'fmgdbalkjihec', //remove later
  'abcdefghijklm',
  'ecdibmhfajkgl',
  'ilckfgdebhjam'
];

var orderIndex = 0;

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

var dialog = document.querySelector('.dialog');
var didWin = false;

function win() {
  if ( !didWin ) {
    document.querySelector('.dialog__text').innerHTML = 'Nice work!<br>';
  }
  //add logic for disconnecting socket, saving the results
  didWin = true;
  socket.emit('game-over', {
    room: currentRoom,
    msg: 'Game Over!',
    winner: 'MEME'
  });
  showDialog();
}


// function showDialog() {
//   dialog.classList.remove('is-waiting');
// }

// function hideDialog() {
//   dialog.classList.add('is-waiting');
// }

// dialog.querySelector('.try-again-button').onclick = function() {
//   hideDialog();
//   shuffleTiles();
// }

// dialog.querySelector('.close-dialog-button').onclick = hideDialog;

document.querySelector('.shuffle-button').onclick = shuffleTiles;

pckry.on( 'dragItemPositioned', function() {
  var order = pckry.items.map( function( item ) {
    return item.element.getAttribute('data-tile');
  }).join('');
  if ( pckry.maxY === 500 && order === 'fmgdbalkjihce' ) {
    win();
  }
});

})();