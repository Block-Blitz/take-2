$(document).ready(function(){
  $('#registerForm').on('submit', function(e){
    e.preventDefault();
    const name = $('#name').val();
    const email = $('#email').val();
    const password = $('#password').val();
    console.log('I am the jquery befroe it gets ajexd' + name, email, password);
    registerData = {
      name,
      email,
      password
    };
    $.ajax ({
      url: '/register',
      method: 'POST',
      data: registerData,
      success: function(data) {
        // renderTweets(database);
        console.log('success');
      }
    });
  });
});
