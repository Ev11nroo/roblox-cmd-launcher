let config = require("./config.json");
const fs = require("fs");

async function checkForCsrf(response) {
    const csrf = await response.headers.get("x-csrf-token");

    if (!await csrf) {
        return null;
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
            "Content-Type": "application/json",
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

    const potentialCsrf = await checkForCsrf(request);

    if (potentialCsrf != null) {
        return {
            "status": "NeedsCsrf",
            "csrf": `${potentialCsrf}`
        };
    }

    if (await request.status != 200) {
        if (await request.status == 400) {
            console.log("Login request timed out, please try again (12)")
            return {
                "status": "TimedOut"
            }
        } else {
            console.log(`Failed getting quick login status (13): ${await request.status}`)
            return {
                "status": "Failed",
                "httpCode": await request.status
            }
        }
    }

    const data = await request.json();
    return (await data);
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
    let csrf = "uyswoW5mUcmv", code = "", privateKey = "";
    let statusCheck = true;

    const tokenData = await createToken();

    if (tokenData == null) {
        return 11;
    }

    // check for program closure to invalidate token
    process.on("SIGINT", async () => {
        console.log("Cancelled login request");
        statusCheck = false;
        invalidateToken(tokenData.code);
    });

    code = tokenData.code;
    privateKey = tokenData.privateKey

    console.log(`Use "Quick Sign In" or open the link (https://www.roblox.com/crossdevicelogin/ConfirmCode) and input: ${code}`);

    while (statusCheck) {
        const tokenStatus = await checkToken(code, privateKey, csrf);
        console.log(tokenStatus);

        switch (tokenStatus.status) {
            case "NeedsCsrf":
                csrf = tokenStatus.csrf
                break;
            case "TimedOut":
                statusCheck = false;
                return 12;
                break;
            case "Failed":
                statusCheck = false;
                return tokenStatus.httpCode;
                break;
            case "Created":
            case "UserLinked":
                break; // do nothing, still waiting on confirmation
            case "Cancelled":
                console.error("Login request cancelled by user (15)");
                statusCheck = false;
                break;
            case "Validated":
                statusCheck = false;
                console.log("User confirmed token, logging in");
                break;
        }

        await (new Promise(promise => setTimeout(promise, 4 * 1000))); // wait for 4 seconds
    }
}

startLoginProcess()