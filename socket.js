const socket = new WebSocket(`ws://${window.location.host}`);

socket.onmessage = function(event) {
  loadComments();
};

function sendUpdate() {
  socket.send('update');
}

$('#codeForm').submit(function() {
  sendUpdate();
});

$('.commentForm').submit(function() {
  sendUpdate();
});
