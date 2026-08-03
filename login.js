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

    const data = await request.json();
    console.log(await data)
    console.log(await data.code);

    return (await data);
}

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

process.on("SIGINT", () => {
    console.log("Cancelled request")
})

createToken()