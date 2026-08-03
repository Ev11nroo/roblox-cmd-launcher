let config = require("./config.json");
const fs = require("fs");

let csrf = "", code = "", privateKey = "";

let statusOptions = {
    method: "POST",
    headers: {
        "x-csrf-token": `${csrf}`
    },
    body: JSON.stringify({
        code: `${code}`,
        privateKey: `${privateKey}`,
    })
};

async function checkForCsrf(response) {
    const csrf = await response.headers.get("x-csrf-token");

    if (!await csrf) {
        console.error(`XCSRF Token could not be grabbed (1): ${await response.status}`);
        return 1;
    }

    csrf = (await csrf);
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
}

async function checkToken() {
    let request;

    try {
        request = await fetch("https://apis.roblox.com/auth-token-service/v1/login/status", statusOptions);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }
}

async function invalidateToken() {
    let request;

    try {
        request = await fetch("https://apis.roblox.com/auth-token-service/v1/login/cancel", statusOptions);
    } catch (e) {
        console.error("Failed to complete request (7)");
        return 7;
    }
}

createToken()