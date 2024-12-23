const { cookie, browserTrackerId, joinAttemptId, writeToFile} = require('./config.json')
const fs = require('fs')

if (fs.existsSync('./uri.txt')) {
  fs.unlinkSync('./uri.txt', err => { if (err) throw err; })
}

const options = {
    method: 'POST',
    headers: {
      cookie: `${cookie}`,
      referer: 'https://www.roblox.com/',
    },
    body: 'false'
};

let playToken;

// send out the HTTP requests
// get X-CSRF-TOKEN
function getCSRFAndAuthenticate(unixtime, gameId, privateServerAccessCode, friendId) {
    const aquireXCSRF = fetch('https://auth.roblox.com/v2/logout', options)
        .then(async response => { 
          const csrf = await response.headers.get('x-csrf-token');
          if (!csrf) {
            console.error(`XCSRF Token could not be grabbed. (1): ${response.status}`)
            return 1;
          }

          console.log('Got XCSRF Token successfully!')
          return csrf
        })
        .catch(err => console.error(err))

    // get authentication token to launch game
    aquireXCSRF.then(csrf => {
        const authOptions = {
        method: 'POST',
        headers: {
          cookie: `${cookie}`,
          referer: 'https://www.roblox.com/',
          'x-csrf-token': `${csrf}`
        },
        body: 'false'
        };
    
    const getAuthTicket = fetch('https://auth.roblox.com/v1/authentication-ticket', authOptions)
        .then(async response => { 
          if (await response.status != 200) {
            console.error(`Could not authenticate with Roblox. (2): ${response.status}`)
            return 2;
          }

          console.log('Authenticated successfully with Roblox!')

          const authTicket = response.headers.get('rbx-authentication-ticket')
          if (!authTicket) {
            console.error(`Could not get ticket. (3): ${response.status}`)
            return 3;
          }

          console.log('Got Authentication Ticket!')

          playToken = `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${unixtime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3D${browserTrackerId}%26placeId%3D${gameId}%26isPlayTogetherGame%3Dtrue%26joinAttemptId%3D${joinAttemptId}%26joinAttemptOrigin%3DPlayButton+browsertrackerid:${browserTrackerId}+robloxLocale:en_us+gameLocale:en_us+channel:`

          if (privateServerAccessCode != null) {
            playToken = `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${unixtime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestPrivateGame%26browserTrackerId%3D${browserTrackerId}%26placeId%3D${gameId}%26accessCode%3D${privateServerAccessCode}%26joinAttemptId%3D${joinAttemptId}%26joinAttemptOrigin%3DprivateServerListJoin+browsertrackerid:${browserTrackerId}+robloxLocale:en_us+gameLocale:en_us+channel:`
          }

          if (friendId != null && privateServerAccessCode == null) {
            playToken = `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${unixtime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestFollowUser%26browserTrackerId%3D${browserTrackerId}%26userId%3D${friendId}%26joinAttemptId%3D${joinAttemptId}%26joinAttemptOrigin%3DJoinUser+browsertrackerid:${browserTrackerId}+robloxLocale:en_us+gameLocale:en_us+channel:`
          }

          if (!writeToFile) {
            console.log("\nURI: ", playToken)
            return 0;
          }

          fs.writeFile('./uri.txt', playToken, err => { if (err) throw err; })
          console.log('\nWritten your URI to "uri.txt"')
        })
        .catch(err => console.error(err));
    })
} 

// tell roblox that we want to launch game
function launch() {
   fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchAttempt_Unknown', options)
        .then(async response => { 
          if (await response.status != 200) {
            console.error(`Could not complete request. (4): ${response.status}`)
            return 4;
          }

          console.log('Successfully told that a game wants to be launched')
        })
        .catch(err => console.error(err)); 
} 

// tell roblox to generate launch parameters (i think)
function launchProtocol() {
    fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchAttempt_Unknown_Protocol', options)
        .then(async response => { 
        if (await response.status != 200) {
          console.error(`Could not complete request. (4) ${response.status}`)
          return 4;
        }

        console.log('Successfully told to give launch parameters')
        })
        .catch(err => console.error(err));  
} 

// set user status to unknown
function setUserStatusToUnknown() {
    fetch('https://www.roblox.com/client-status/set?status=Unknown', options)
        .then(async response => { 
        if (await response.status != 200) {
          console.error(`Could not complete request. (4) ${response.status}`)
          return 4;
        }

        console.log('Set user status to "Unknown"')
        })
        .catch(err => console.error(err));
} 

// tell roblox that game was launched successfully
function gameLaunchSuccessful() {
  fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchSuccessWeb_Unknown', options)
    .then(response => { 
    if (response.status != 200) {
      console.error(`Could not complete request. (4) ${response.status}`)
      return 4;
    }

    console.log('Told Roblox that game launch was successful')
    })
    .catch(err => console.error(err));
}

// tell roblox that game launched successfully (with protocol!!!!!!)
function gameLaunchSuccessful_Protocol() {
  fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchSuccessWeb_Unknown_Protocol', options)
    .then(response => { 
    if (response.status != 200) {
      console.error(`Could not complete request. (4) ${response.status}`)
      return 4;
    }

    console.log('Told Roblox that game launch was successful (with protocol!!!!!!!!)')
    })
    .catch(err => console.error(err));
}

module.exports = {
    getCSRFAndAuthenticate,
    launch,
    launchProtocol,
    setUserStatusToUnknown,
    gameLaunchSuccessful,
    gameLaunchSuccessful_Protocol
}
