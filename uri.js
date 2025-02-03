const { writeToFile, cookie } = require('./config.json');
const fs = require('fs');

function createURI(authTicket, privateServerAccessCode, friendId, unixtime, gameId, browserTrackerId, joinAttemptId) {
    let initalUri = `roblox-player:1+launchmode:play+launchtime:${unixtime}+`;
    let placeLauncherUrl = `https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26placeId%3D${gameId}%26`;
    
    if (cookie != null || authTicket != null) {
        initalUri += `gameinfo:${authTicket}+`;
    }
    
    if (browserTrackerId != null) {
        initalUri += `browsertrackerid:${browserTrackerId}+`
        placeLauncherUrl += `browserTrackerId%3D${browserTrackerId}%26`
    }
    
    if (joinAttemptId != null) {
        placeLauncherUrl += `joinAttemptId%3D${joinAttemptId}%26`
    }
    
    if (privateServerAccessCode != null) {
        placeLauncherUrl = placeLauncherUrl.replace("request%3DRequestGame", "request%3DRequestPrivateGame");
        placeLauncherUrl += `accessCode%3D${privateServerAccessCode}%26`;
    }
    
    if (friendId != null) {
        placeLauncherUrl = placeLauncherUrl.replace("request%3DRequestGame", "request%3DRequestFollowUser")
        placeLauncherUrl = placeLauncherUrl.replace(`placeId%3D${gameId}`, "")
        placeLauncherUrl += `userId%3D${friendId}%26`
    }

    initalUri += "placelauncherurl:"
    let uri = `${initalUri}${placeLauncherUrl}`
    
    if (!writeToFile) {
        console.log("\nURI:", uri)
        return 0;
    }

    fs.writeFile('./uri.txt', uri, err => { if (err) throw err; })
    console.log('\nWritten your URI to "uri.txt"')
}

module.exports = {
    createURI
}