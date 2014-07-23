var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });

var connections = {},
		connectionID = 0,
		connectedUsers = [],
		player1 = false,
		player2 = false;
		// activeplayer = player1;


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

  socket.on('shot', function (cell) {
  	socket.broadcast.emit('shot', cell);
  	console.log('shot fired');
  });

  socket.on('hit', function (cell) {
  	socket.broadcast.emit('hit', cell);
  	console.log('Hit received by server')
  	//   	if (activeplayer === player1){
  	// 	activeplayer === player2;
  	// } else {
  	// 	activeplayer === player1;
  	// };
  });

  socket.on('miss', function (cell){
  	socket.broadcast.emit('miss', cell);
  	console.log('Miss received by server')
  });

  socket.on('sendmessage', function(msg){
    console.log('in chat message event');
    io.emit('receivemessage', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

