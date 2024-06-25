$(document).ready(function() {
    // Handle code submission
    $('#codeForm').submit(function(e) {
      e.preventDefault();
  
      const language = $('#language').val();
      const code = $('#code').val();
  
      $.ajax({
        url: '/submit',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ language, code }),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        success: function(response) {
          $('#output').text(response.output);
          loadComments();
        },
        error: function(xhr) {
          alert(xhr.responseJSON.error);
        }
      });
    });
  
    // Handle user login
    $('#loginForm').submit(function(e) {
      e.preventDefault();
  
      const email = $('#email').val();
      const password = $('#password').val();
  
      $.ajax({
        url: '/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function(response) {
          localStorage.setItem('token', response.token);
          window.location.href = '/';
        },
        error: function(xhr) {
          alert(xhr.responseJSON.error);
        }
      });
    });
  
    // Handle user signup
    $('#signupForm').submit(function(e) {
      e.preventDefault();
  
      const username = $('#username').val();
      const email = $('#email').val();
      const password = $('#password').val();
  
      $.ajax({
        url: '/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, email, password }),
        success: function(response) {
          alert('User registered successfully. Please login.');
          window.location.href = 'login.html';
        },
        error: function(xhr) {
          alert(xhr.responseJSON.error);
        }
      });
    });
  
    // Load comments
    function loadComments() {
      $.ajax({
        url: '/codes',
        method: 'GET',
        success: function(codes) {
          const commentsSection = $('#commentsSection');
          commentsSection.empty();
  
          codes.forEach(code => {
            const codeBlock = `
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">${code.language}</h5>
                  <pre>${code.code}</pre>
                  <p>Output: ${code.output}</p>
                </div>
                <div class="card-footer">
                  <form class="commentForm" data-code-id="${code._id}">
                    <div class="form-group">
                      <label for="comment">Add Comment</label>
                      <textarea class="form-control comment" rows="2"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Comment</button>
                  </form>
                  <div class="comments">
                    ${code.comments.map(comment => `<p>${comment.comment}</p>`).join('')}
                  </div>
                </div>
              </div>
            `;
            commentsSection.append(codeBlock);
          });
  
          // Handle comment submission
          $('.commentForm').submit(function(e) {
            e.preventDefault();
  
            const codeId = $(this).data('code-id');
            const comment = $(this).find('.comment').val();
  
            $.ajax({
              url: '/comment',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({ codeId, comment }),
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              success: function(response) {
                loadComments();
              },
              error: function(xhr) {
                alert(xhr.responseJSON.error);
              }
            });
          });
        },
        error: function(xhr) {
          alert(xhr.responseJSON.error);
        }
      });
    }
  
    loadComments();
  });