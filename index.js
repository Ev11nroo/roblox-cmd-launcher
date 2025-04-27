const { cookie, writeToFile, command, updateChecker } = require('./config.json');
const { exec } = require('child_process');
let { gameId, privateServerAccessCode, friendId } = require('./config.json');
const fs = require('fs');

const unixtime = Math.floor(Date.now() / 1000);

const currentVersion = fs.readFileSync('./version.txt', 'utf8', (err) => { if (err) console.log(err) });
let githubVersion;

if (fs.existsSync('./uri.txt')) {
    fs.unlinkSync('./uri.txt', err => { if (err) throw err; });
}

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
                    );
            return 0;
    }
}

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

function createURI(authTicket, privateServerAccessCode, friendId, unixtime, gameId) {
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

    initalUri += "placelauncherurl:";
    let uri = `${initalUri}${placeLauncherUrl}`;
    
    if (!writeToFile && !command) {
        console.log("\nURI:", uri);
        return 0;
    }

    if (command && !writeToFile) {
        console.log(`\nRunning '${command}' with URI`);
        exec(`${command} "${uri}"`);
        return 0;
    }

    fs.writeFile('./uri.txt', uri, err => { if (err) throw err; });
    console.log('\nWritten your URI to "uri.txt"');
}

if (cookie == null) {
    createURI(null, privateServerAccessCode, friendId, timestamp, gameId);
    return 0;
}

if (friendId != null && privateServerAccessCode != null) {
    console.error("privateServerAccessCode requires to be 'null' to use friendId (5)");
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
            console.error(`XCSRF Token could not be grabbed. (1): ${response.status}`);
            return 1;
        }
        return csrf;
        })
    .catch(err => console.error(err));

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
                console.error(`Could not authenticate with Roblox. (2): ${response.status}`);
                return 2;
            }

            const authTicket = response.headers.get('rbx-authentication-ticket');
            if (!authTicket) {
                console.error(`Could not get ticket. (3): ${response.status}`);
                return 3;
            }

            createURI(authTicket, privateServerAccessCode, friendId, unixtime, gameId);
        })
        .catch(err => console.error(err));
})
