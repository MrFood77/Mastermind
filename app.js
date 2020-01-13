class GameManager {
  constructor(id) {
    this.host = null;
    this.player = null;
    this.id = 0;
    this.players = 0;
    this.answer = "";
  }

  newPlayer(value) {
    console.log("creating new player with value = " + value);
    if (this.host === null) {
      this.host = value;
      this.players = 1;
    } else {
      this.player = value;
      this.players = 2;
    }
  }
}

const express = require("express");
const http = require("http");
const websocket = require("ws");

const port = process.argv[2];
const app = express();

app.get('/greetme', function(req, res) {
  res.send("Hello person");
});

app.get('/', function(req, res) {
  res.sendFile("splash.html", {root: "./public"});
});

app.get('/play', function(req, res) {
  res.sendFile("game.html", {root: "./public"});
});

/* app.get('/*', function (req, res) {
  res.send("This route is not defined, please go to \'/\'");
});*/

app.use(express.static(__dirname + "/public"));
const server = http.createServer(app);

const wss = new websocket.Server({ server });

const websockets = {};
const gameID = 0; // Unique id given to each connection to identify them.
const theGame = new GameManager(0);

wss.on("connection", function(ws) {
  const connection = ws;
  gameID++;
  connection.id = gameID;
  websockets[connection.id] = theGame;

  if (theGame.players == 0) {
    // Our current connection is going to be a host
    connection.type = "host";
    connection.send("host");
    theGame.newPlayer(connection);
  } else if (theGame.players == 1) {
    // Our current connection is going to be a player
    connection.type = "player";
    connection.send("player");
    theGame.newPlayer(connection);
    // The current game is full, we need to start and make a new one
    theGame.player.send("ready");
    theGame.host.send("start");
    theGame = new GameManager();
  }

  console.log("Player connected with id as %s", connection.id);

  console.log(connection.id + " disconnected ...");
  // Someone closes the connection
  ws.on("close", function() {
    // When a player closes the game, the other player automatically wins.
    const game = websockets[ws.id];
    if (game.host == ws) {
      if (game.player === !null) {
        game.player.send("win");
      }
    } else {
      game.host.send("win");
    }
  });

  // Incoming message from a player.
  ws.on("message", function incoming(message) {
    const game = websockets[ws.id];

    console.log(websockets[ws.id].id);
    console.log("[LOG], game id: %s, hostid: %s, playerid: %s.", game.id,
        game.host.id, game.player.id);
    console.log("[LOG], send by %s, who is %s: %s", ws.id, ws.type, message);

    if (game.host == ws) {
      // The host has made their selection.
      console.log("the host has made their selection");
      game.answer = message;
      game.player.send("go");
    } else {
      // The player has made a move
      console.log("the player has made a move");
      game.host.send(message);
      // Check if correct
      if (game.answer == message) {
        console.log("the player move was correct");
        game.player.send("win");
        game.host.send("lose");
      } else {
        console.log("the player move was false");
        game.player.send("false");
      }
    }
  });
});

server.listen(port);
