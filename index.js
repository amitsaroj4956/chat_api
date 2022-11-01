let express = require("express");
let app = express();
let Conversation = require("./Database/Controller");
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const http = require("http").createServer(app);
const dotenv = require("dotenv");
dotenv.config();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
let path = require("path");
let a = app.use(express.static(__dirname + "/"));
app.use(express.static(__dirname + "/"));
app.get("/*", (req, res) => res.sendFile(path.join(__dirname)));
let http = require("http");
let server = http.Server(app);

let socketIO = require("socket.io");

const io = socketIO(server, {
    cors: {
        origins: ["http://localhost:3000", "http://localhost:3001", "http://localhost:4200", "https://droupons.arivani.com", "https://swingerchat.ityogistech.com", "https://drouponsapinode.arivani.com", "http://localhost:4200", "https://swingerflings.com", "https://demo.swingerflings.com", "*",
        ],
    },
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    next();
});
const port = process.env.PORT || 5000;
var clients = [{
    id: 0,
    userId: 0,
    name: 'Test User',
    userProfile: 'null',
    busy: false
},];
var busyUsers = [];
var numUsers = 0;

io.on("connection", (socket) => {
    // console.log("User Connected", socket.id);
    /*  
    //api for fetching chat data
      Conversation.getAllConverstion('id', function (res) {
          console.log("res", res.length, clients.length);
          if (clients.length <= 5) {
  
              const uniqueIds = new Set();
  
              const unique = res.filter(data => {
                  const isDuplicate = uniqueIds.has(data.sender_id);
                  uniqueIds.add(data.sender_id);
                  if (!isDuplicate) {
                      return true;
                  }
                  //return false;
              });
              console.log(clients, "clients");
              unique.forEach((data) => {
                  //console.log(data, "data");
                  clients.push({
                      id: data.sender_id,
                      userId: data.sender_id,
                      busy: false
                  });
              })
              console.log(clients, "clients2");
          }
      }) */

    var addedUser = false;
    socket.on("disconnect", () => {
        // console.log("user disconnected", socket.id);
    });
    socket.on("my message", (msg) => {
        let data = [];
        data.push(msg);

        io.emit("my broadcast", data);
    });
    socket.on("new-message", (data) => {
        socket.broadcast.to(data.toid).emit("new-message", data);
    });
    socket.on("add user", (userId, name, userProfile) => {

        const isFound = clients.some((element) => {
            if (element.userId === userId) {
                return true;
            }
            return false;
        });

        if (!isFound) {
            if (addedUser) {

                clients.push({
                    id: socket.id,
                    userId: userId,
                    name: name,
                    userProfile: userProfile,
                    busy: false,
                });
            } else {

                clients.push({
                    id: socket.id,
                    userId: userId,
                    name: name,
                    userProfile: userProfile,
                    busy: false,
                });
            }
        }
        // we store the userId in the socket session for this client
        socket.userId = userId;
        ++numUsers;
        addedUser = true;
        socket.emit("login-user-count", {
            numUsers: numUsers,
        });
        socket.emit("logged-user", {
            userId: socket.userId,
            numUsers: numUsers,
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit("user joined", {
            userId: socket.userId,
            numUsers: numUsers,
        });
        socket.broadcast.emit("client-list", clients);
        console.log(busyUsers, "client-list", clients);
        setInterval(() => {
            socket.broadcast.emit('client-list', clients);
            // console.log('client-list', clients);
        }, 3000);
    });
    // when the client emits 'typing', we broadcast it to others
    socket.on("typing", () => {
        socket.broadcast.emit("typing", {
            userId: socket.userId,
        });
    });
    // when the client emits 'stop typing', we broadcast it to others
    socket.on("stop typing", () => {
        socket.broadcast.emit("stop typing", {
            userId: socket.userId,
        });
    });
    // when the user disconnects.. perform ye wala code
    socket.on("disconnect", () => {
        if (addedUser) {
            --numUsers;
            if (clients.length > 0) {
                var i = 0;
                clients.forEach((a) => {
                    if (a.userId == socket.userId) {
                        clients.splice(i, 1);
                    }
                    i++;
                });
            }
            // var index = clients.indexOf(socket.userId);
            // if (index !== -1) {
            //     clients.splice(index, 1);
            // }

            if (busyUsers.length > 0) {
                var i = 0;
                busyUsers.forEach((a) => {
                    if (a.userId == socket.userId) {
                        busyUsers.splice(i, 1);
                    }
                    i++;
                });
            }
            // echo globally that this client has left
            socket.broadcast.emit("user-left", socket.userId);
        }
    });
    /***
     * Section Video call
     * following requests are used for video call
     */
    socket.on("video-call", (data) => {
        socket.broadcast.to(data.toid).emit("video-call", data);
    });
    socket.on("video-call-accept", (data) => {
        socket.broadcast.to(data.toid).emit("video-call-accept", data);
    });
    socket.on("video-call-reject", (data) => {
        socket.broadcast.to(data.toid).emit("video-call-reject", data);
    });
    socket.on("get-busy-user", () => {
        socket.broadcast.emit("get-busy-user", busyUsers);
    });
    socket.on("busy-user", () => {
        busyUsers.push({
            id: socket.id,
            userId: socket.userId,
        });
        socket.broadcast.emit("get-busy-user", busyUsers);
    });
    socket.on("end-video-call", (data) => {
        if (busyUsers.length > 0) {
            var usr1 = busyUsers.find((a) => a.userId == socket.userId);
            var index1 = busyUsers.indexOf(usr1);
            busyUsers.splice(index1, 1);
            var usr2 = busyUsers.find((a) => a.userId == data.toname);
            var index2 = busyUsers.indexOf(usr2);
            busyUsers.splice(index2, 1);
        }
        socket.broadcast.to(data.toid).emit("video-call-ended", data);
        socket.broadcast.emit("get-busy-user", busyUsers);
    });
    // when the caller emits 'call-request', this listens and executes
    socket.on("call-request", (data) => {
        // we tell the client to execute 'call-request'
        socket.broadcast.to(data.toid).emit("call-request", {
            userId: socket.userId,
            data: data,
        });
    });
});
app.get("/", (req, res) => {
    res.send("<h1 style='text-align:center'>Welcome to Video Call App</h1>");
});
server.listen(port, () => {
    // console.log(`started on port: ${port}`);
});
