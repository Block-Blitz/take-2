$(document).ready(function(){

  $('.tutorial-button').on('click', function(){
    $('.tutorial').toggleClass('is-waiting');
  });

  $('.tutorial').find('.close').on('click', function(){
    $('.tutorial').addClass('is-waiting');
  });

  $('#hamburger').click(function() {
    $('#mobilemenu').slideToggle();
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

  $.ajax({
    method: "GET",
    url: "api/leaderboard"
    }).done((data) => {
      console.log('leadboard data', data);
      for(let user of data) {
        $('.leaderboard-list').append(`<div class="leaderboard-entry">${user.name}: ${user.wins} Total wins</div>`);
      }
  });

});
