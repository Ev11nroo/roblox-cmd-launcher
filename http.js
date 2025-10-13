const { cookie, browserTrackerId, joinAttemptId } = require('./config.json');
const { createURI } = require('./uri');
const fs = require('fs');

if (fs.existsSync('./uri.txt')) {
    fs.unlinkSync('./uri.txt', err => { if (err) throw err; });
}

const options = {
    method: 'POST',
    headers: {
        cookie: `${cookie}`,
        referer: 'https://www.roblox.com/',
    },
    body: 'false'
};

const getMethodOptions = {
    method: 'GET',
    headers: {
        cookie: `${cookie}`,
        referer: 'https://www.roblox.com/',
    }
}

let playToken;

// send out the HTTP requests
// get X-CSRF-TOKEN
function getCSRFAndAuthenticate(unixtime, gameId, privateServerAccessCode, friendId, serverId) {
    const aquireXCSRF = fetch('https://auth.roblox.com/v2/logout', options)
        .then(async response => { 
            const csrf = await response.headers.get('x-csrf-token');
            if (!csrf) {
                console.error(`XCSRF Token could not be grabbed (1): ${response.status}`);
                return 1;
            }

            console.log('Got XCSRF Token successfully');
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
                console.error(`Could not authenticate (2): ${response.status}`);
                return 2;
            }

            console.log('Authenticated successfully');

            const authTicket = response.headers.get('rbx-authentication-ticket');
            if (!authTicket) {
                console.error(`Could not get authentication ticket (3): ${response.status}`);
                return 3;
            }

            console.log('Got Authentication Ticket');
            createURI(authTicket, privateServerAccessCode, friendId, unixtime, gameId, browserTrackerId, joinAttemptId, serverId);
        })
        .catch(err => console.error(err));
    })
} 

function getAccessCodeFromPrivateServerId(gameId, privateServerId) {
    const getPrivateServer = fetch(`https://games.roblox.com/v1/games/${gameId}/private-servers?limit=100`, getMethodOptions);
    const accessCode = getPrivateServer.then(async response => {
        if (await response.status != 200) {
            console.error(`Could not fetch private server access code (8): ${response.status}`);
            return 8;
        }

        const data = await response.json();

        const privateServers = data.data;
        for (let i = privateServers.length - 1; i >= 0; i--) {
            const privateServer = privateServers[i];
            const id = privateServer.vipServerId;

            if (id == privateServerId) {
                return privateServer.accessCode;
            }

            console.warn(`No private server could be found under the game, defaulting to public servers`);
            return null;
        }
    });
    
    return accessCode.then(code => { return code });
}

module.exports = {
    getCSRFAndAuthenticate,
    getAccessCodeFromPrivateServerId,
}
