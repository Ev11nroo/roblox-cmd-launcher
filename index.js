const { cookie, gameId, writeToFile } = require('./config.json')
const fs = require('fs')

const joinAttemptId = 'whatever'
const browserTrackerId = 'whatever'

const unixtime = Math.floor(Date.now() / 1000);

const options = {
  method: 'POST',
  headers: {
    cookie: `${cookie}`
  },
  body: 'false'
};

const aquireXCSRF = fetch('https://auth.roblox.com/v2/logout', options)
    .then(async response => { 
      const csrf = await response.headers.get('x-csrf-token');
      if (csrf) {
        return csrf
      } else {
        throw new Error('XCSRF Token could not be grabbed, no cookie provided or servers are having issues.')
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
            if (await response.status != 200) {
                throw new Error('Could not authenticate, XCSRF token failed or authentication servers are having issues.')
            }

            const authTicket = response.headers.get('rbx-authentication-ticket')
            if (authTicket) {
            const playToken = `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${unixtime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3D${browserTrackerId}%26placeId%3D${gameId}%26isPlayTogetherGame%3Dfalse%26joinAttemptId%3D${joinAttemptId}%26joinAttemptOrigin%3DPlayButton+browsertrackerid:${browserTrackerId}+robloxLocale:en_us+gameLocale:en_us+channel:`
            
            if (!writeToFile) {
              console.log(playToken)
              return 0;
            }

            fs.writeFile('./playtoken.txt', playToken, err => { if (err) throw err; })
            console.log('Written your play token to "playtoken.txt"')
            
            } else {
                throw new Error('Could not get ticket, XCSRF token failed or authentication servers are having issues.')
            }
        })
        .catch(err => console.error(err));
})
