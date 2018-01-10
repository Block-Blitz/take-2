$(document).ready(function(){

  $('.tutorial-button').on('click', function(){
    $('.tutorial').toggleClass('is-waiting');
  });

  $('.tutorial').find('.close').on('click', function(){
    $('.tutorial').addClass('is-waiting');
  });

  $('#hamburger').click(function() {
    $('#mobilemenu').slideToggle();
    $(this).toggleClass('open');
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
