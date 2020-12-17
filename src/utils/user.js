const users = []

//addUser
const addUser = (({ id, username, room }) => {
    //sanitize data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validatee data
    if (!username || !room) {
        return {
            error: "Username and room are required"
        }
    }
    // check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })
    //validate username
    if (existingUser) {
        return {
            error: "Username already taken"
        }
    }
    const user = { id, username, room }
    users.push(user)
    return { user }

})
//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }


}
//getUser
const getUser = (id) => {
    return users.find((user) => user.id === id)
}//all users in a single room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}