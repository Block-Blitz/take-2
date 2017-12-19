$(document).ready(function(){
  $('#loginForm').on('submit', function(e){
    e.preventDefault();

    const email = $('#email').val();
    const password = $('#password').val();
    console.log('I am the jquery befroe it gets ajexd' +  email, password);
    loginData = {
      email,
      password
    };
    $.ajax ({
      url: '/login',
      method: 'POST',
      data: loginData,
      success: function(data) {
        // renderTweets(database);
        // location.reload();
        console.log('success');
      }
    });
  });
});
