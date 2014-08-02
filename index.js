var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var connections = {},
		connectionID = 0,
		connectedUsers = [],
		player1 = false,
		player2 = false;
		// active_user = player1;


io.on('connection', function(socket){
  console.log('got a connection');
  console.log(connections);

  socket.on('username', function (username) {
		if (connections.username) {
			socket.emit('user exists');
		} else {
			
			socket.username = username;
			socket.userID = connectionID++;

			connections[socket.username] = {
				username: socket.username,
				userID: socket.userID,
				socket: socket
			};

			for (var key in connections) {
				var data = {};

				data.username = connections[key].username;
				data.userID = connections[key].userID;

				connectedUsers.push(data);

				if (key !== socket.username) {
					connections[key].socket.emit('new user', socket.username, socket.userId);		
				}
			}
			console.log('username added to server: '+ username)
			socket.emit('username added to server', connectedUsers);
		}
	});
 
  // assign player1 or player2 
  socket.on('startgame', function (username) {
		if (player1 && !player2) {
			player2 = username;
			console.log('player 2! cool beans!');
			io.emit('game in progress');
		} else {	
			player1 = username;
			console.log('player1! hey!');
			io.emit('creategame', username);
		};
	});

  // notify player when opponent ready
	socket.on('player ready', function(){
		socket.broadcast.emit('opponent ready');
		console.log('opponent ready');
	});

	socket.on('active_user set', function(){
		socket.broadcast.emit('Wait');
		console.log('active_user set')
	});

  // direct shot to enemy 
  socket.on('shot', function (cell) {
  	socket.broadcast.emit('shot', cell);
  	console.log('shot fired');
  });

  // direct hit to active_user
  socket.on('hit', function (cell) {
  	socket.broadcast.emit('hit', cell);
  	console.log('Hit received by server')
  });

  // direct miss to active_user
  socket.on('miss', function (cell){
  	socket.broadcast.emit('miss', cell);
  	console.log('Miss received by server')
  });

  // switch active_user
  socket.on('turn complete', function(){
  	console.log('switching active_user')
  	// if (active_user === player1){
  	// 	active_user = player2;
  	// } else {
  	// 	active_user = player1;
  	// };
  	socket.broadcast.emit('Your turn');
  });

  socket.on('game over', function(){
  	console.log('Game Over. You Win!');
  	socket.broadcast.emit('winner');
  });

  // chat message handling
  socket.on('sendmessage', function(msg){
    console.log('in chat message event');
    io.emit('receivemessage', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

