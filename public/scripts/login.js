$(document).ready(function(){
  $('#loginForm').on('submit', function(e){
    e.preventDefault();

    const email = $('#email').val();
    const password = $('#password').val();
    loginData = {
      email,
      password
    };
    $.ajax ({
      url: '/login',
      method: 'POST',
      data: loginData,
      success: function(msg){
        location.reload();
      },
      error: function(err) {
        location.reload();
      }
    });
  });
});
