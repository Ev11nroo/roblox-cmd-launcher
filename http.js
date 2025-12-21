const { cookie } = require('./config.json');
const { createURI } = require('./uri');

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
function getCSRF() {
    let aquireXCSRF;

    try {
        aquireXCSRF = fetch('https://auth.roblox.com/v2/logout', options);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }

    const csrfToken = aquireXCSRF.then(async response => { 
        const csrf = await response.headers.get('x-csrf-token');
        if (!csrf) {
            console.error(`XCSRF Token could not be grabbed (1): ${response.status}`);
            return 1;
        }
        console.log('Got XCSRF Token successfully');
        return csrf;
    })

    return csrfToken.then(csrf => { return csrf });
}

// get authentication ticket
function authenticate(csrf, unixtime, gameId, privateServerAccessCode, friendId, serverId) {
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
        }

        console.warn(`No private server could be found under the game, defaulting to public servers`);
        return null;
    });
    
    return accessCode.then(code => { return code });
}

// get information for private server from linkCode
function getPrivateServerInfoFromLinkCode(csrf, linkCode) {
    let privateServerId;

    const linkOptions = {
        method: 'POST',
        headers: {
            cookie: `${cookie}`,
            referer: 'https://www.roblox.com/',
            'x-csrf-token': `${csrf}`,
            'Content-Type': 'application/json'
        },
        body: `{
            "linkId": "${linkCode}",
            "linkType": "Server"
        }`
    };

    try {
        privateServerId = fetch("https://apis.roblox.com/sharelinks/v1/resolve-link", linkOptions);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }

    const privateServerInfo = privateServerId.then(async response => {
        if (await response.status != 200) {
            console.error(`Could not fetch private server ID from link code (8): ${response.status}`);
            return 8;
        }

        const data = await response.json();
        return data.privateServerInviteData;
    })

    return privateServerInfo.then(info => { return info });
}

// the most scuffed way to get the access code (roblox give us an api endpoint)\
// reading directly from the html content
function getAccessCodeFromPrivateServerLinkCode(gameId, privateServerLinkCode) {
    let gameScreen;

    try {
        gameScreen = fetch(`https://www.roblox.com/games/${gameId}?privateServerLinkCode=${privateServerLinkCode}`, getMethodOptions);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }

    const accessCode = gameScreen.then(async response => {
        const content = await response.text();
        const searchString = `Roblox.GameLauncher.joinPrivateGame(${gameId}, `;
        const searchResult = content.indexOf(searchString);
        let code = "";

        if (searchResult == -1) {
            console.error("Could not fetch accessCode from privateServerLinkCode (9)");
            return 9;
        }

        for (let i = 0; i < 36; i++) {
            code += content[searchResult + searchString.length + 1 + i]
        }

        return code;
    })

    return accessCode.then(code => { return code; });
}

module.exports = {
    getCSRF,
    authenticate,
    getAccessCodeFromPrivateServerId,
    getPrivateServerInfoFromLinkCode,
    getAccessCodeFromPrivateServerLinkCode,
}
