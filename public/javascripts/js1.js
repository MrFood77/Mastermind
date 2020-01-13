// Variables
let selector = "red";
const socket = new WebSocket("ws://localhost:3000");
let player = null;

// Server stuff
socket.onmessage = function(event) {
  console.log(event.data);
  if (player === null) {
    player = event.data;
  }
  switch (event.data) {
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
      addTempRow();
      break;
    case "ready":
      document.getElementById("instruction").innerHTML =
      "Players found, wait for the host to determine the answer.";
      break;
    case "go":
      document.getElementById("instruction").innerHTML =
      "The host has determined what the answer should be, start guessing!";
      addTempRow("first", "second", "third", "fourth");
      break;
    case "false":
      document.getElementById("instruction").innerHTML =
      "That answer was false, try again.";
      addTempRow("first", "second", "third", "fourth");
      break;
    case "win":
      document.getElementById("instruction").innerHTML =
      "Congratulations, you won!";
      break;
    case "lose":
      document.getElementById("instruction").innerHTML =
      "Sadly, you have lost.";
      break;
    default:
      const words = event.data.split(' ');
      addPermaRow(words[0], words[1], words[2], words[3]);
      break;
  }
};

socket.onopen = function() {
  console.log("Socket openened");
};

function myFunction(a) {
  selector = a;
}

function addPermaRow(a, b, c, d) {
  const newRow = document.createElement("tr");
  const th1 = document.createElement("th");
  th1.innerHTML = a;
  const th2 = document.createElement("th");
  th2.innerHTML = b;
  const th3 = document.createElement("th");
  th3.innerHTML = c;
  const th4 = document.createElement("th");
  th4.innerHTML = d;
  newRow.append(th1, th2, th3, th4);

  $("#gameTable").append(newRow);
}

function addTempRow(a, b, c, d) {
  const newRow = document.createElement("tr");
  newRow.id = "tempRow";
  const th1 = document.createElement("th");
  th1.className = "row";
  th1.id = "first";
  th1.innerHTML = a;
  const th2 = document.createElement("th");
  th2.className = "row";
  th2.id = "second";
  th2.innerHTML = b;
  const th3 = document.createElement("th");
  th3.className = "row";
  th3.id = "third";
  th3.innerHTML = c;
  const th4 = document.createElement("th");
  th4.className = "row";
  th4.id = "fourth";
  th4.innerHTML = d;

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
    const first = document.getElementById("first").innerHTML;
    const second = document.getElementById("second").innerHTML;
    const third = document.getElementById("third").innerHTML;
    const fourth = document.getElementById("fourth").innerHTML;

    removeRow();
    addPermaRow(first, second, third, fourth);

    const move = first + " " + second + " " + third + " " + fourth;
    socket.send(move);
  });
}

function removeRow() {
  $("#tempRow").remove();
}

function rowClicked(a) {
  document.getElementById(a).innerHTML = selector;
}

// Function for when the site opens
$( document ).ready( function() {});

/*


var move = [first, second, third, fourth]
addTempRow("first", "second", "third", "fourth");
*/
