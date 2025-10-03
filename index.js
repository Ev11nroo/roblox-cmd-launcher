const { getCSRFAndAuthenticate, getAccessCodeFromPrivateServerId, launch, launchProtocol, setUserStatusToUnknown, gameLaunchSuccessful, gameLaunchSuccessful_Protocol } = require('./http');
const { createURI } = require('./uri');
const { replicate, cookie, updateChecker, browserTrackerId, joinAttemptId } = require('./config.json');
let { gameId, privateServerAccessCode, friendId, serverId, privateServerId } = require('./config.json');
const timestamp = Math.floor(Date.now() / 1000);
const fs = require('fs');

const currentVersion = fs.readFileSync('./version.txt', 'utf8', (err) => { if (err) console.log(err) });
let githubVersion;

for (i = process.argv.length; i >= 1; i--) {
    switch (process.argv[i]) {
        case '-g':
        case '--gameId':
            gameId = process.argv[i + 1];
            break;
        case '-p':
        case '--accessCode':
            privateServerAccessCode = process.argv[i + 1];
            break;
        case '-f':
        case '--friendId':
            friendId = process.argv[i + 1];
            break;
        case '-s':
        case '--serverId':
            serverId = process.argv[i + 1];
            break;
        case '-i':
        case '--privateServerId':
            privateServerId = process.argv[i + 1];
            break;
        case '-h':
        case '--help':
            console.log('Usage: node index.js [ARGUMENTS]\n' + 
                        'Example: node index.js -g 1234567890 -p d818fnf3-28dn-ad34-la72-h6cv8h4fj9g4\n\n' + 
                        'Arguments:\n' + 
                        '    -g, --gameId               Game ID used here will bypass config.json\n' + 
                        '    -p, --accessCode           Private server access code used here will bypass config.json\n' +
                        '                               (NOTE: Private server MUST exist within the Game ID. Access to the private server is required.)\n' + 
                        '    -i, --privateServerId      The private server id to join to\n' + 
                        '    -h, --help                 Show this help menu\n' + 
                        '    -f, --friendId             The user ID to follow to a game\n' + 
                        '    -s, --serverId             The server/game ID to join a specific server of a place\n'
                    );
            return 0;
    }
}

//version checker
if (updateChecker) {
    fetch('https://raw.githubusercontent.com/Ev11nroo/roblox-cmd-launcher/refs/heads/main/version.txt')
    .then(data => data.text())
    .then(data => githubVersion = data)
    .then(() => {
        if (currentVersion < githubVersion) {
            console.log('This version is outdated, please update from https://github.com/Ev11nroo/roblox-cmd-launcher')
        }
    });
}

if (cookie == null) {
    createURI(null, privateServerAccessCode, friendId, timestamp, gameId, browserTrackerId, joinAttemptId);
    return 0;
}

console.log("Starting requests to Roblox\n");

if (friendId != null && privateServerAccessCode != null) {
    console.error("privateServerAccessCode reqires to be 'null' to use friendId (5)");
    return 5;
}

if (friendId != null && serverId != null) {
    console.error("serverId requires to be 'null' to use friendId (6)")
    return 6;
}

if (serverId != null && privateServerAccessCode != null) {
    console.error("privateServerAccessCode requires to be 'null' to use serverId (7)");
    return 7;
}

if (privateServerAccessCode != null && privateServerId != null) {
    console.error("privateServerAccessCode requires to be 'null' to user privateServerId (9)");
    return 9;
}

if (gameId == null && privateServerId != null) {
    console.error("privateServerId requires gameId (10)");
    return 10;
}


// send out HTTP requests
if (!replicate) {
    if (privateServerId != null) {
        const code = getAccessCodeFromPrivateServerId(gameId, privateServerId);
        code.then(code => {
            console.log('Obtained private server access code');
            getCSRFAndAuthenticate(timestamp, gameId, code, friendId, serverId);
        });
        return 0;
    }

    getCSRFAndAuthenticate(timestamp, gameId, privateServerAccessCode, friendId, serverId);
} else {
    console.warn("warn: replicate option is deprecated, please disable it")

    if (privateServerId != null) {
        console.warn("warn: privateServerId is not compatible with replicate option enabled");
    }

    getCSRFAndAuthenticate(timestamp, gameId, privateServerAccessCode, friendId, serverId);
    launch();
    launchProtocol();
    setUserStatusToUnknown();
    gameLaunchSuccessful();
    gameLaunchSuccessful_Protocol();
}
