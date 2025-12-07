const { cookie } = require('./config.json');
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
    let aquireXCSRF;

    try {
        aquireXCSRF = fetch('https://auth.roblox.com/v2/logout', options);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }

    aquireXCSRF.then(async response => { 
        const csrf = await response.headers.get('x-csrf-token');
        if (!csrf) {
            console.error(`XCSRF Token could not be grabbed (1): ${response.status}`);
            return 1;
        }
        console.log('Got XCSRF Token successfully');
        return csrf;
    })

    // get authentication token to launch game
    .then(csrf => {
        const authOptions = {
            method: 'POST',
            headers: {
                cookie: `${cookie}`,
                referer: 'https://www.roblox.com/',
                'x-csrf-token': `${csrf}`
            },
            body: 'false'
        };
    
        let getAuthTicket;
    
        try {
            getAuthTicket = fetch('https://auth.roblox.com/v1/authentication-ticket', authOptions);
        } catch (e) {
            console.error("Failed to complete request (7)");
            return 7;
        }

        getAuthTicket.then(async response => { 
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
            createURI(authTicket, privateServerAccessCode, friendId, unixtime, gameId, serverId);
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
} 

function getAccessCodeFromPrivateServerId(gameId, privateServerId) {
    let getPrivateServer;

    try {
        getPrivateServer = fetch(`https://games.roblox.com/v1/games/${gameId}/private-servers?limit=100`, getMethodOptions);
    } catch (e) {
        console.error("failed to complete request (7)");
        return 7;
    }

    const accessCode = getPrivateServer.then(async response => {
        if (await response.status != 200) {
            console.error(`Could not fetch private server access code (5): ${response.status}`);
            return 5;
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
