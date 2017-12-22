$(document).ready(function(){


// Added security for input, making sure no one can pass scripts as messages
   function escape(str) {
     const div = document.createElement('div');
     div.appendChild(document.createTextNode(str));
     return div.innerHTML;
   }

  $('#login-form').on('submit', function(e){
    e.preventDefault();

    const email = escape($('#email').val());
    const password = escape($('#password').val());
    console.log(email);
    console.log(password);
    const loginData = {
      email,
      password
    };
    $.ajax ({
      url: '/login',
      method: 'POST',
      data: loginData,
      success: function(msg){
        location.replace('/');
      },
      error: function(err) {
        location.reload();
      }
    });
  });
});
