/** express server */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const pageRouter = require('./routes/page.router');



const app = express();
let port = process.env.PORT || 8000;



const server = require('http').createServer(app);
const io = require('socket.io')();



let db = "";
if(process.env.IS_HEROKU_DEPLOYMENT){
    db = process.env.db;
}else{
    let secret = require('./config/secret.json');
    db = secret.db;
}

mongoose.Promise = global.Promise;
let dbInfo = (db.startsWith("mongodb://localhost:")) ? "local db" : "cloud db";
mongoose.connect(db).then(()=>{
    console.log('[OK] MongoDB is connected to ' + dbInfo);
}).catch((err) => {
    console.log('[err] MongoDB failed to connect to ' + dbInfo);
})


// let pageSockets = {} /** {puid1:[clients], puid2:[clients]} */
let pages = []

io.on('connection', (socket)=>{
    // start emitting events to client
    // console.log('new client connected');
    socket.emit('newMessage', "Welcome to the application");
    socket.broadcast.emit('newMessage', "New visitor joined");    
/**
 * io.emit   => emit to everyone
 *      io.to(theRoom).emit   to everyone in the room
 * socket.broadcast.emit => emit to everyone in the socket, except the current user
 *      socket.broadcast.to(theRoom).emit  => to everyong in the room except current user
 * socket.emit => emit to 1 user
 *      
 * socket.leave(theRoom)
 */
    socket.on('join', (params) =>{
        // console.log('a client want to join : ' + params.username);

        if(!params.puid){
            cb('Puid required.');
            return;
        }
        socket.join(params.puid);
        socket.emit('newMessage', "Hi there, welcome to this page: " + params.puid);
        socket.broadcast.to(params.puid).emit('newMessage',"New user joined this page");
        // cb();
        
    });

    socket.on('update', (params) =>{
        // console.log('a client want to update')
        if(!params.puid){
            console.log('Puid required.');
            return;
        }
        socket.broadcast.to(params.puid).emit('update',params);
    });


    
});


io.listen(server);
console.log('io is listening at server');


/** MID */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// static 
app.use(express.static(path.join(__dirname, 'dist')));

app.get("/", (req, res)=>{
    if(process.env.IS_HEROKU_DEPLOYMENT){
        var _path = path.join(__dirname + 'index.html'); /** this is to use static page, which is Anguar 4 build */
        console.log({"root":"heroku mode"});
        res.sendFile(_path)
    }else{
        console.log({"root":"local mode"});
        res.json({"root":"local mode"})
    }
})

app.use('/api/page', pageRouter);

server.listen(port, ()=>{
    console.log('Server is running at: ' + port);
})


