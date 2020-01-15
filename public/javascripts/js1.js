// Variables
let selector = "red";
const socket = new WebSocket("ws://localhost:3000");
let player = null;

// Server stuff
socket.onmessage = function(event) {
  moves = event.data.split(' ');
  console.log(event.data);
  if (player === null) {
    player = event.data;
  }
  switch (moves[0]) {
    case "invalid":
      document.getElementById("instruction").innerHTML =
      "That move was invalid, try again.";
      addTempRow("red", "red", "red", "red");
      break;
    case "host":
      document.getElementById("instruction").innerHTML =
      "Waiting for players.";
      break;
    case "player":
      document.getElementById("instruction").innerHTML =
      "Waiting for players.";
      break;
    case "start":
      document.getElementById("instruction").innerHTML =
      "Players found, you are the host, please start.";
      addTempRow("red", "red", "red", "red");
      break;
    case "ready":
      document.getElementById("instruction").innerHTML =
      "Players found, wait for the host to determine the answer.";
      break;
    case "go":
      document.getElementById("instruction").innerHTML =
      "The host has determined what the answer should be, start guessing!";
      addTempRow("red", "red", "red", "red");
      break;
    case "win":
      document.getElementById("instruction").innerHTML =
      "Congratulations, you won!";
      addPermaRow4(moves[1], moves[2], moves[3], moves[4]);
      break;
    case "lose":
      document.getElementById("instruction").innerHTML =
      "Sadly, you have lost.";
      addPermaRow4(moves[1], moves[2], moves[3], moves[4]);
      break;
    case "playerAnswer":
      // What do to when the player sends an answer to the host?
      document.getElementById("instruction").innerHTML =
      "The player has send an aswer.";
      addPermaRow6(moves[1], moves[2], moves[3], moves[4], moves[5], moves[6]);
      break;
    case "display":
      addPermaRow4(moves[1], moves[2], moves[3], moves[4]);
      break;
    case "false":
      // What to do when the player makes a false move?
      document.getElementById("instruction").innerHTML =
      "Your answer was false.";
      addPermaRow6(moves[1], moves[2], moves[3], moves[4], moves[5], moves[6]);
      addTempRow("red", "red", "red", "red");
      break;
    default:
      console.log("PROBLEMS");
      break;
  }
};

socket.onopen = function() {
  console.log("Socket openened");
};

function removeRow() {
  $("#tempRow").remove();
}

function rowClicked(a) {
  document.getElementById(a).className = "row " + selector;
}

function colourSelector(a) {
  selector = a;
}

function addPermaRow6(a, b, c, d, e, f) {
  const newRow = document.createElement("tr");
  const th1 = document.createElement("th");
  th1.className = a;
  const th2 = document.createElement("th");
  th2.className = b;
  const th3 = document.createElement("th");
  th3.className = c;
  const th4 = document.createElement("th");
  th4.className = d;
  const th5 = document.createElement("th");
  th5.innerHTML = e;
  const th6 = document.createElement("th");
  th6.innerHTML = f;
  newRow.append(th5, th1, th2, th3, th4, th6);

  $("#gameTable").append(newRow);
}

function addPermaRow4(a, b, c, d) {
  const newRow = document.createElement("tr");
  const th1 = document.createElement("th");
  th1.className = a;
  const th2 = document.createElement("th");
  th2.className = b;
  const th3 = document.createElement("th");
  th3.className = c;
  const th4 = document.createElement("th");
  th4.className = d;
  newRow.append(th1, th2, th3, th4);

  $("#gameTable").append(newRow);
}

function addTempRow(a, b, c, d) {
  const newRow = document.createElement("tr");
  newRow.id = "tempRow";
  const th1 = document.createElement("th");
  th1.classList.add('row', a);
  th1.id = "first";
  const th2 = document.createElement("th");
  th2.classList.add('row', b);
  th2.id = "second";
  const th3 = document.createElement("th");
  th3.classList.add('row', c);
  th3.id = "third";
  const th4 = document.createElement("th");
  th4.classList.add('row', d);
  th4.id = "fourth";

  const th5 = document.createElement("th");
  th5.id = "done";
  th5.innerHTML = "I'm done making a selection";

  newRow.append(th1, th2, th3, th4, th5);

  $("#gameTable").append(newRow);

  $(".row").click( function() {
    rowClicked(this.id);
  });

  // When the player is done with their turn they click this button.
  $("#done").click( function() {
    const first = document.getElementById("first").className.slice(4);
    const second = document.getElementById("second").className.slice(4);
    const third = document.getElementById("third").className.slice(4);
    const fourth = document.getElementById("fourth").className.slice(4);

    removeRow();
    // vaddPermaRow4(first, second, third, fourth);

    const move = first + " " + second + " " + third + " " + fourth;
    console.log("The move made was " + move);

    socket.send(move);
  });
}
