//client side
const socket = io()
//dom variables
$messageForm = document.querySelector('#message-form')
$messageFormInput = $messageForm.querySelector('#textMsg')
$messageFormButton = $messageForm.querySelector('#btnSend')
$locationButton = document.querySelector('#btnLocation')

$messages = document.querySelector('#messages')
//templates
$messageTemplate = document.querySelector('#message-template').innerHTML
$locationTemplate = document.querySelector('#location-template').innerHTML
$sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//function for scrolling

const autoscroll = () => {
    //newmessage
    const $newMessage = $messages.lastElementChild
    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    //height of container
    const containerHeight = $messages.scrollHeight
    //how much srcoll
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight

    }
}
//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
///messages
socket.on('message', (message) => {
    console.log(message)
    //message template
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
//location message
socket.on('locationMessage', (url) => {
    console.log(url)
    //location template
    const html = Mustache.render($locationTemplate, {
        username: url.username,
        url: url.locationUrl,
        createdAt: moment(url.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable buuton
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value


    socket.emit('sendMessage', message, (feedback) => {
        console.log(feedback)
    })
    //enableButton
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ""
    $messageFormInput.focus()
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    //disable location button
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,

        }, (feedback) => {
            console.log(feedback)
            //enable location button
            $locationButton.removeAttribute('disabled')
        })

    })
})

//join room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


