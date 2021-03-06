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
const ejs = require("ejs");
const cookieParser = require("cookie-parser");

// If no port is provided, use port 3000.
let port = 3000;
if (process.argv[2]) {
  port = process.argv[2];
}
const app = express();

app.set('views', __dirname + '/public');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());

let numberOfMoves = 0;
let numberOfGames = 0;
let currentGames = 0;

function amountCorrect(a, b) {
  const moves = a.split(' ');
  const answer = b.split(' ');
  let corTotal = 0;
  let corPlace = 0;
  for (i = 0; i < 4; i++) {
    if (moves[i] == answer[i]) {
      corTotal++;
      moves[i] = "notacolor1";
      answer[i] = "notacolor2";
    }
  }
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      if (moves[i] == answer[j]) {
        corPlace++;
        break;
      }
    }
  }
  return corTotal + " " + corPlace;
}

// app.get('/greetme', function(req, res) {
//   res.send("Hello person");
// });

app.get('/', function(req, res) {
  // res.sendFile("splash.html", {root: "./public"});
  const n = numberOfMoves / numberOfGames;
  const averageMoves = n !== n ?
    "No games played yet" : n + " guesses on average.";
  co = req.cookies;
  timesPlayed = co.timesPlayed == undefined ? 0 : parseInt(co.timesPlayed);
  playerGames = timesPlayed;
  res.render("splash", {
    currentGames: currentGames,
    totalGames: numberOfGames,
    averageMoves: averageMoves,
    playerGames: playerGames,
  });
});

app.get('/play', function(req, res) {
  co = req.cookies;
  timesPlayed = co.timesPlayed == undefined ? 0 : parseInt(co.timesPlayed);
  res.cookie("timesPlayed", timesPlayed + 1);
  res.sendFile("game.html", {root: "./public"});
});

app.get('/stylesheets/style.css', function(req, res) {
  res.sendFile("stylesheets/style.css");
});

app.get('/*', function(req, res) {
  res.send("ERROR 404: path not defined");
});

// Function for checking whether a given move is valid.
function validMove(a) {
  const moves = a.split(' ');
  for (i = 0; i < 4; i++) {
    console.log(i);
    if (!(moves[i]=='red' || moves[i]=='blue' ||
        moves[i]=='green' || moves[i]=='pink')) {
      return false;
    }
  }
  return true;
}

app.use(express.static(__dirname + "/public"));
const server = http.createServer(app);

const wss = new websocket.Server({ server });

const websockets = new Map();
let gameID = 0; // Unique id given to each connection to identify them.
let theGame = new GameManager(0);

wss.on("connection", function(ws) {
  const connection = ws;
  gameID++;
  connection.id = gameID;
  websockets.set(connection.id, theGame);

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
    localNumberOfMoves = 0;
    currentGames++;
  }

  console.log("Player connected with id as %s", connection.id);

  // Someone closes the connection
  ws.on("close", function() {
    // When a player closes the game, the other player automatically wins.
    const game = websockets.get(ws.id);
    if (game.host == ws) {
      if (game.player === !null) {
        game.player.send("disconnected");
      }
    } else {
      game.host.send("disconnected");
    }
    currentGames--;
  });

  // Incoming message from a player.
  ws.on("message", function incoming(message) {
    const game = websockets.get(ws.id);

    // Check whether the given move is valid.
    // If it's not valid
    if (!validMove(message)) {
      ws.send("invalid");
    } else {
      console.log(websockets.get(ws.id).id);
      console.log("[LOG], game id: %s, hostid: %s, playerid: %s.", game.id,
          game.host.id, game.player.id);
      console.log("[LOG], send by %s, who is %s: %s", ws.id, ws.type, message);
      if (game.host == ws) {
        // The host has made their selection.
        console.log("the host has made their selection");
        game.answer = message;
        game.player.send("go");
        game.host.send("display " + message);
      } else {
        // The player has made a move
        console.log("the player has made a move");
        // Check how much of the move is correct.
        game.host.send("playerAnswer " + message + " " +
        amountCorrect(message, game.answer));
        // Check if correct
        if (game.answer == message) {
          console.log("the player move was correct");
          game.player.send("win " + message);
          game.host.send("lose " + message);
          numberOfMoves += localNumberOfMoves;
          numberOfGames++;
          currentGames--;
        } else {
          console.log("the player move was false");
          if (localNumberOfMoves >= 8) {
            game.player.send("outOfMoves");
            game.host.send("won");
          } else {
            game.player.send("false " + message + " " +
            amountCorrect(message, game.answer));
            localNumberOfMoves++;
          }
        }
      }
    }
  });
});

server.listen(port);
