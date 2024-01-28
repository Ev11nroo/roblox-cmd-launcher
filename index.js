const { getCSRFAndAuthenticate, launch, launchProtocol, setUserStatusToUnknown } = require('./http')
const timestamp = Math.floor(Date.now() / 1000);

console.log("Communicating with Roblox...\n")

// send out HTTP requests
getCSRFAndAuthenticate(timestamp)
launch()
launchProtocol()
setUserStatusToUnknown()