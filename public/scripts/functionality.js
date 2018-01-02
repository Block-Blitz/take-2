$(document).ready(function(){

  $('.tutorial-button').on('click', function(){
    $('.tutorial').toggleClass('is-waiting');
  });

  $('.tutorial').find('.close').on('click', function(){
    $('.tutorial').addClass('is-waiting');
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

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
  const x = document.getElementById('myTopnav');
  if (x.className === 'topnav') {
    x.className += ' responsive';
  }
  else {
    x.className = 'topnav';
  }
}
