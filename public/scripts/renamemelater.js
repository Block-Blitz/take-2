$(document).ready(function(){
  $('.logout-button').on('click', function(e){
    console.log('hellllo');
    e.preventDefault();
    $.ajax ({
      url: '/logout',
      method: 'POST',
      success: function(){
        location.reload();
      }
    });
  });
});
