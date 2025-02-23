const { cookie, browserTrackerId, joinAttemptId } = require('./config.json')
const { createURI } = require('./uri')
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
          createURI(authTicket, privateServerAccessCode, friendId, unixtime, gameId, browserTrackerId, joinAttemptId)
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
