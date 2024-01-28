const { getCSRFAndAuthenticate, launch, launchProtocol, setUserStatusToUnknown, gameLaunchSuccessful, gameLaunchSuccessful_Protocol } = require('./http')
const { replicate } = require('./config.json')
const timestamp = Math.floor(Date.now() / 1000);

console.log("Communicating with Roblox...\n")

// send out HTTP requests
if (!replicate) {
    getCSRFAndAuthenticate(timestamp)
} else {
    getCSRFAndAuthenticate(timestamp)
    launch()
    launchProtocol()
    setUserStatusToUnknown()
    gameLaunchSuccessful()
    gameLaunchSuccessful_Protocol()
}
