import ws from 'k6/ws';
import http from 'k6/http';
import { check } from 'k6';

var urlBase = "https://localhost:5001";
var huburl = "chatHub";
var webSocketBase = "wss://localhost:5001";

export default function () {
  // Get the connection id to use in the web socket connect
  var res = http.post(`${urlBase}/${huburl}/negotiate`, null, {
    "responseType": "text"
  }
  );
  var connectionId = res.json()["connectionId"];

  var url = `${webSocketBase}/${huburl}?id=${connectionId}`;

  var response = ws.connect(url, {
    headers: {
      // "Cookie": `${authCookieName}=${authCookie}`,
      "Origin": urlBase,
    }
  }, function (socket) {
    socket.on('open', function open() {
      // Once socket is connected send protocol request
      socket.send('{"protocol":"json","version":1})\x1e');
      console.log('sent protocol request');
    });

    socket.on('message', function (message) {
      switch (message) {
        case '{}\x1e':
          // This is the protocol confirmation
          break;
        case '{"type":6}\x1e':
          // Received handshake
          break;
        default:
          // should check that the JSON contains type === 1
          console.log(`Received message: ${message}`);
      }
    });

    socket.on('error', function (e) {
      if (e.error() != "websocket: close sent") {
        console.log('An unexpected error occurred: ', e.error());
      }
    });

    socket.setTimeout(function () {
      console.log('60 seconds passed, closing the socket');
      socket.close();
    }, 60000);
  });

  check(response, { "status is 101": (r) => r && r.status === 101 });

}

