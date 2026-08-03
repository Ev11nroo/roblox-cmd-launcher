let config = require("./config.json");
const fs = require("fs");

async function checkForCsrf(response) {
    const csrf = await response.headers.get("x-csrf-token");

    if (!await csrf) {
        console.error(`XCSRF Token could not be grabbed (1): ${await response.status}`);
        return 1;
    }

    return (await csrf);
}

async function createToken() {
    let request;

    try {
        request = await fetch("https://apis.roblox.com/auth-token-service/v1/login/create", {
            method: "POST"
        });
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }

    if (await request.status != 200) {
        console.error(`Failed getting quick login token (11): ${request.status}`)
        return null;
    }

    const data = await request.json();
    return (await data);
}

// NOTE: requires csrf
async function checkToken(code, privateKey, csrf) {
    const statusOptions = {
        method: "POST",
        headers: {
            "x-csrf-token": `${csrf}`
        },
        body: JSON.stringify({
            code: `${code}`,
            privateKey: `${privateKey}`,
        })
    };

    let request;

    try {
        request = await fetch("https://apis.roblox.com/auth-token-service/v1/login/status", statusOptions);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }
}

async function invalidateToken(code) {
    const statusOptions = {
        method: "POST",
        body: JSON.stringify({
            code: `${code}`
        })
    };

    let request;

    try {
        request = await fetch("https://apis.roblox.com/auth-token-service/v1/login/cancel", statusOptions);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }
}

async function startLoginProcess() {
    let csrf = "", code = "", privateKey = "";

    const tokenData = await createToken();

    if (tokenData == null) {
        return 11;
    }

    // check for program closure to invalidate token
    process.on("SIGINT", async () => {
        console.log("Cancelled request");
        invalidateToken(await tokenData.code);
    });

    code = await tokenData.code;
    privateKey = await tokenData.privateKey

    console.log(`Use "Quick Sign In" or open the link (https://www.roblox.com/crossdevicelogin/ConfirmCode) and input: ${code}`);
}

startLoginProcess()