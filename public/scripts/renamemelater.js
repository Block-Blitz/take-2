$(document).ready(function(){
  $('.logout-button').on('click', function(e){
    console.log('hellllo');
    e.preventDefault();
    $.ajax ({
      url: '/logout',
      method: 'POST',
      success: function(){
        FB.logout(function(response) {
                console.log('logging out.');
                // user is now logged out
              });
        location.replace('/');
      }
    });
  });


});
