const { getCSRFAndAuthenticate, launch, launchProtocol, setUserStatusToUnknown, gameLaunchSuccessful, gameLaunchSuccessful_Protocol } = require('./http')
const { replicate } = require('./config.json')
var { gameId } = require('./config.json')
const timestamp = Math.floor(Date.now() / 1000);

console.log("Communicating with Roblox...\n")

if (process.argv[2] != undefined) {
    gameId = process.argv[2]
}

// send out HTTP requests
if (!replicate) {
    getCSRFAndAuthenticate(timestamp, gameId)
} else {
    getCSRFAndAuthenticate(timestamp, gameId)
    launch()
    launchProtocol()
    setUserStatusToUnknown()
    gameLaunchSuccessful()
    gameLaunchSuccessful_Protocol()
}