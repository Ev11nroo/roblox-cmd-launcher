const { cookie, browserTrackerId, joinAttemptId, writeToFile} = require('./config.json')
const fs = require('fs')

const options = {
    method: 'POST',
    headers: {
      cookie: `${cookie}`
    },
    body: 'false'
};

// send out the HTTP requests
// get X-CSRF-TOKEN
function getCSRFAndAuthenticate(unixtime, gameId) {
    const aquireXCSRF = fetch('https://auth.roblox.com/v2/logout', options)
        .then(async response => { 
          const csrf = await response.headers.get('x-csrf-token');
          if (csrf) {
            console.log('Got XCSRF Token successfully!')
            return csrf
          } else {
            console.error('XCSRF Token could not be grabbed, no cookie provided or servers are having issues.')
          }
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
          if (await response.status == 200) {
            console.log('Authenticated successfully with Roblox!')
          } else {
            console.error('Could not authenticate, XCSRF token failed or authentication servers are having issues.')
          }
          
          const authTicket = response.headers.get('rbx-authentication-ticket')
          if (authTicket) {
            console.log('Got Authentication Ticket!')

            const playToken = `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${unixtime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3D${browserTrackerId}%26placeId%3D${gameId}%26isPlayTogetherGame%3Dfalse%26joinAttemptId%3D${joinAttemptId}%26joinAttemptOrigin%3DPlayButton+browsertrackerid:${browserTrackerId}+robloxLocale:en_us+gameLocale:en_us+channel:`
            
            if (!writeToFile) {
              console.log("\nHere is your play token:\n", playToken)
              return 0;
            }

            fs.writeFile('./playtoken.txt', playToken, err => { if (err) throw err; })
            console.log('\nWritten your play token to "playtoken.txt"')
            
          } else {
            console.error('Could not get ticket, XCSRF token failed or authentication servers are having issues.')
          }
        })
        .catch(err => console.error(err));
    })
} 

// tell roblox that we want to launch game
function launch() {
   fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchAttempt_Unknown', options)
        .then(async response => { 
          if (await response.status == 200) {
            console.log('Successfully told that a game wants to be launched')
          } else {
            console.error('Could not complete, no cookie provided or servers are having issues.')
          }
        })
        .catch(err => console.error(err)); 
} 

// tell roblox to generate launch parameters (i think)
function launchProtocol() {
    fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchAttempt_Unknown_Protocol', options)
        .then(async response => { 
        if (await response.status == 200) {
          console.log('Successfully told to give launch parameters')
        } else {
          console.error('Could not complete, no cookie provided or servers are having issues.')
        }
        })
        .catch(err => console.error(err));  
} 

// set user status to unknown
function setUserStatusToUnknown() {
    fetch('https://www.roblox.com/client-status/set?status=Unknown', options)
        .then(async response => { 
        if (await response.status == 200) {
          console.log('Set user status to "Unknown"')
        } else {
          console.error('Could not complete, no cookie provided or servers are having issues.')
        }
        })
        .catch(err => console.error(err));
} 

// tell roblox that game was launched successfully
function gameLaunchSuccessful() {
  fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchSuccessWeb_Unknown', options)
    .then(response => { 
    if (response.status == 200) {
      console.log('Told Roblox that game launch was successful')
    } else {
      console.error('Could not complete, no cookie provided or servers are having issues.')
    }
    })
    .catch(err => console.error(err));
}

// tell roblox that game launched successfully (with protocol!!!!!!)
function gameLaunchSuccessful_Protocol() {
  fetch('https://assetgame.roblox.com/game/report-event?name=GameLaunchSuccessWeb_Unknown_Protocol', options)
    .then(response => { 
    if (response.status == 200) {
      console.log('Told Roblox that game launch was successful (with protocol!!!!!!!!)')
    } else {
      console.error('Could not complete, no cookie provided or servers are having issues.')
    }
    })
    .catch(err => console.error(err));
}


// check current user status (doesnt even work here lo)
/*fetch('https://www.roblox.com/client-status?_=1706387466', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));*/

module.exports = {
    getCSRFAndAuthenticate,
    launch,
    launchProtocol,
    setUserStatusToUnknown,
    gameLaunchSuccessful,
    gameLaunchSuccessful_Protocol
}
