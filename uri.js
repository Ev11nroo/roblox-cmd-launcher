const { writeToFile, cookie, command } = require('./config.json');
const { exec } = require('child_process')
const fs = require('fs');

function createURI(authTicket, privateServerAccessCode, friendId, unixtime, gameId, serverId) {
    let initalUri = `roblox-player:1+launchmode:play+launchtime:${unixtime}+`;
    let placeLauncherUrl = `https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGame&placeId=${gameId}&`;
    
    if (cookie != null || authTicket != null) {
        initalUri += `gameinfo:${authTicket}+`;
    }
    
    if (privateServerAccessCode != null) {
        placeLauncherUrl = placeLauncherUrl.replace("request=RequestGame", "request=RequestPrivateGame");
        placeLauncherUrl += `accessCode=${privateServerAccessCode}&`;
    }
    
    if (friendId != null) {
        placeLauncherUrl = placeLauncherUrl.replace("request=RequestGame", "request=RequestFollowUser");
        placeLauncherUrl = placeLauncherUrl.replace(`placeId=${gameId}`, "");
        placeLauncherUrl += `userId=${friendId}&`;
    }

    if (serverId != null) {
        placeLauncherUrl = placeLauncherUrl.replace("request=RequestGame", "request=GameJob");
        placeLauncherUrl += `gameId=${serverId}&`;
    }

    initalUri += "placelauncherurl:";
    let uri = `${initalUri}${placeLauncherUrl}`;
    
    if (!writeToFile && !command) {
        console.log("\nURI:", uri);
        return 0;
    }

    if (command && !writeToFile) {
        console.log(`\nRunning '${command}' with URI`);

        if (command.includes("%URI")) {
            exec(`${command.replace("%URI", uri)}`);
            return 0;
        }

        exec(`${command} "${uri}"`);
        return 0;
    }

    fs.writeFile('./uri.txt', uri, err => { if (err) throw err; });
    console.log('\nWritten your URI to "uri.txt"');
}

module.exports = {
    createURI
}