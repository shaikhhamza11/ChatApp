// serving statics
const path = require('path')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname, '../public')

//socket io connection
const http = require('http')
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server);
app.use(express.static(publicDirectory))
//packages
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
//function
const { addUser, removeUser, getUsersInRoom, getUser } = require("./utils/user")

//socket connection
io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    //room
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        //welcome user
        socket.emit('message', generateMessage("Admin", `Welcome! ${user.username}`))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has join the ${user.room} Room`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)

        })
        callback()

    })
    //listening message
    socket.on('sendMessage', (message, callback) => {
        //getting user
        const user = getUser(socket.id)
        //check for profanity
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(`${user.username}`, message))
        callback('Message Delievered')
    })

    //send location
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`${user.username}`, `https://www.googlemaps.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Location Shared')
    })
    //disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left the room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)

            })
        }
    })
})


server.listen(port, () => {
    console.log('Server is listening at port', port)
})
