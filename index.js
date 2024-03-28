const { getCSRFAndAuthenticate, launch, launchProtocol, setUserStatusToUnknown, gameLaunchSuccessful, gameLaunchSuccessful_Protocol } = require('./http')
const { replicate } = require('./config.json')
let { gameId, privateServerAccessCode } = require('./config.json')
const timestamp = Math.floor(Date.now() / 1000);

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
        case '-h':
        case '--help':
            console.log('Usage: node index.js [ARGUMENTS]\n' + 
                        'Example: node index.js -g 1234567890 -p d818fnf3-28dn-ad34-la72-h6cv8h4fj9g4\n\n' +
                        'Arguments:\n' +
                        '    -g, --gameId        Game ID used here will bypass config.json\n' +
                        '    -p, --accessCode    Private server access code used here will bypass config.json\n' +
                        '                        (NOTE: Private server MUST exist within the Game ID. Access to the private server is required.)\n' +
                        '    -h, --help          Shows this help menu')
            return 0;
    }
}

console.log("Communicating with Roblox...\n")

// send out HTTP requests
if (!replicate) {
    getCSRFAndAuthenticate(timestamp, gameId, privateServerAccessCode)
} else {
    getCSRFAndAuthenticate(timestamp, gameId, privateServerAccessCode)
    launch()
    launchProtocol()
    setUserStatusToUnknown()
    gameLaunchSuccessful()
    gameLaunchSuccessful_Protocol()
}
