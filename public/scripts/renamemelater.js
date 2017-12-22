$(document).ready(function(){

  $('.tutorial-button').on('click', function(){
    $('.tutorial').toggleClass('is-waiting');
  });

  function fbLogoutUser() {
    FB.getLoginStatus(function(response) {
      if (response && response.status === 'connected') {
        FB.logout(function(response) {
          document.location.reload();
        });
      }
    });
  }
  $('.logout-button').on('click', function(e){
    console.log('hellllo');
    e.preventDefault();
    $.ajax ({
      url: '/logout',
      method: 'POST',
      success: function(){
        fbLogoutUser();
        location.replace('/');
      }
    });
  });


});
