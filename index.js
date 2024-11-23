const { cookie, writeToFile } = require('./config.json')
let { gameId, privateServerAccessCode } = require('./config.json')
const fs = require('fs')

const unixtime = Math.floor(Date.now() / 1000);

if (fs.existsSync('./uri.txt')) {
  fs.unlinkSync('./uri.txt', err => { if (err) throw err; })
}

for (i = process.argv.length; i >= 1; i--) {
    switch (process.argv[i]) {
        case '-g':
        case '--gameId':
            gameId = process.argv[i + 1]
            break;
        case '-p':
        case '--accessCode':
            privateServerAccessCode = process.argv[i + 1]
            break;
        case '-f':
        case '--friendId':
            friendId = process.argv[i + 1]
            break;
        case '-h':
        case '--help':
            console.log('Usage: node index.js [ARGUMENTS]\n' + 
                        'Example: node index.js -g 1234567890 -p d818fnf3-28dn-ad34-la72-h6cv8h4fj9g4\n\n' +
                        'Arguments:\n' +
                        '    -g, --gameId        Game ID used here will bypass config.json\n' +
                        '    -p, --accessCode    Private server access code used here will bypass config.json\n' +
                        '                        (NOTE: Private server MUST exist within the Game ID. Access to the private server is required.)\n' +
                        '    -h, --help          Show this help menu\n' + 
                        '    -f, --friendId      The user ID to follow to a game\n'
                    )
            return 0;
    }
}

if (friendId != null && privateServerAccessCode != null) {
  console.error("privateServerAccessCode reqires to be 'null' to use friendId (5)")
  return 5;
}

const options = {
  method: 'POST',
  headers: {
    cookie: `${cookie}`,
    referer: 'https://www.roblox.com/',
  },
  body: 'false'
};

const aquireXCSRF = fetch('https://auth.roblox.com/v2/logout', options)
    .then(async response => { 
        const csrf = await response.headers.get('x-csrf-token');
        if (!csrf) {
            console.error(`XCSRF Token could not be grabbed. (1): ${response.status}`)
            return 1;
        }
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

          const authTicket = response.headers.get('rbx-authentication-ticket')
          if (!authTicket) {
            console.error(`Could not get ticket. (3): ${response.status}`)
              return 3;
          }

          playToken = `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${unixtime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3Dwhatever%26placeId%3D${gameId}%26isPlayTogetherGame%3Dtrue%26joinAttemptId%3Dwhatever}%26joinAttemptOrigin%3DPlayButton+browsertrackerid:whatever+robloxLocale:en_us+gameLocale:en_us+channel:`

          if (privateServerAccessCode != null) {
            playToken = `roblox-player:1+launchmode:play+gameinfo:${authTicket}+launchtime:${unixtime}+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestPrivateGame%26browserTrackerId%3Dwhatever%26placeId%3D${gameId}%26accessCode%3D${privateServerAccessCode}%26joinAttemptId%3Dwhatever%26joinAttemptOrigin%3DprivateServerListJoin+browsertrackerid:whatever+robloxLocale:en_us+gameLocale:en_us+channel:`
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
