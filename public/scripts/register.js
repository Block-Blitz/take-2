$(document).ready(function(){

// Added security for input, making sure no one can pass scripts as messages
  function escape(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  $('#registerForm').on('submit', function(e){
    e.preventDefault();
    const name = escape($('#name').val());
    const email = escape($('#email').val());
    const password = escape($('#password').val());
    const registerData = {
      name,
      email,
      password
    };
    $.ajax ({
      url: '/register',
      method: 'POST',
      data: registerData,
      success: function(msg){
        location.replace('/');
      },
      error: function(err) {
        location.reload();
      }
    });
  });
});
