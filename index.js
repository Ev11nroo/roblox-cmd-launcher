const { getCSRF, authenticate, getAccessCodeFromPrivateServerId, getPrivateServerIdFromLinkCode } = require('./http');
const { createURI } = require('./uri');
const errorHandler = require('./errors')
let preset = 'default';
const { cookie, updateChecker, options } = require('./config.json');
let { gameId, privateServerAccessCode, friendId, serverId, privateServerId, linkCode } = options[preset];
const timestamp = Math.floor(Date.now() / 1000);
const fs = require('fs');
let csrf;

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
        case '-c':
        case '--preset':
            preset = process.argv[i + 1];
            break;
        case '-l':
        case '--linkCode':
            linkCode = process.argv[i + 1];
            break;
        case '-h':
        case '--help':
            console.log('Usage: node index.js [ARGUMENTS]\n' + 
                        'Example: node index.js -g 1234567890 -p d818fnf3-28dn-ad34-la72-h6cv8h4fj9g4\n\n' + 
                        'Arguments:\n' + 
                        '    -c, --preset               The preset to use when loading values from options (overrides all values set)\n' +
                        '    -h, --help                 Show this help menu\n\n' + 
                        '    -g, --gameId               The game ID to join to\n' + 
                        '    -p, --accessCode           The private server access code to join to\n' +
                        '                               (NOTE: Private server MUST exist within the Game ID. Access to the private server is required.)\n' + 
                        '    -i, --privateServerId      The private server id to join to\n' + 
                        '    -f, --friendId             The user ID to follow to a game\n' + 
                        '    -s, --serverId             The server/game ID to join a specific server of a place\n' +
                        '    -l, --linkCode             The code shown in generated private server links'
                    );
            return 0;
    }
}

//version checker
if (updateChecker) {
    let value;

    try {
        value = fetch('https://raw.githubusercontent.com/Ev11nroo/roblox-cmd-launcher/refs/heads/main/version.txt')
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }

    value.then(data => data.text())
    .then(data => githubVersion = data)
    .then(() => {
        if (Number(currentVersion) < Number(githubVersion)) {
            console.log('This version is outdated, please update from https://github.com/Ev11nroo/roblox-cmd-launcher')
        }
    });
}

if (preset != 'default' && options[preset] != null) {
    // is there any better way....
    const values = options[preset];

    gameId = values.gameId;
    privateServerAccessCode = values.privateServerAccessCode;
    friendId = values.friendId;
    serverId = values.serverId;
    privateServerId = values.privateServerId;
    linkCode = values.linkCode;
}

if (cookie == null) {
    createURI(null, privateServerAccessCode, friendId, timestamp, gameId);
    return 0;
}

console.log("Starting requests to Roblox\n");

// error handler (what)
let error = errorHandler.optionsCombinationErrors(gameId, privateServerAccessCode, friendId, serverId, privateServerId, linkCode);
if (error) { return error; }

error = errorHandler.checkForBlankPreset(options[preset], preset);
if (error) { return error; }

// remove uri.txt file if it exists
if (fs.existsSync('./uri.txt')) {
    fs.unlinkSync('./uri.txt', err => { if (err) throw err; });
}

// send out HTTP requests
(async () => {
    csrf = await getCSRF();

    if (linkCode != null) {
        const info = await getPrivateServerIdFromLinkCode(csrf, linkCode);

        if (info != null) {
            console.log("Obtained private server ID from link code");
            privateServerId = info.privateServerId;
            gameId = info.placeId;
        }
    }

    if (privateServerId != null) {
        const code = await getAccessCodeFromPrivateServerId(gameId, privateServerId);

        if (code != null) {
            console.log('Obtained private server access code');
            privateServerAccessCode = code;
        }
    }

    authenticate(csrf, timestamp, gameId, privateServerAccessCode, friendId, serverId);
})();
