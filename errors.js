function isBlank(value) {
    if ((value == null) || (value === "")) {
        return true;
    }

    return false;
}

function optionsCombinationErrors(gameId, privateServerAccessCode, friendId, serverId, privateServerId, linkCode) {
    if (!isBlank(friendId) && !isBlank(privateServerAccessCode)) {
        console.error("privateServerAccessCode requires to be 'null' to use friendId (4)");
        return 4;
    }

    if (!isBlank(friendId) && !isBlank(serverId)) {
        console.error("serverId requires to be 'null' to use friendId (4)")
        return 4;
    }

    if (!isBlank(serverId) && !isBlank(privateServerAccessCode)) {
        console.error("privateServerAccessCode requires to be 'null' to use serverId (4)");
        return 4;
    }

    if (!isBlank(privateServerAccessCode) && !isBlank(privateServerId)) {
        console.error("privateServerAccessCode requires to be 'null' to use privateServerId (4)");
        return 4;
    }

    if (isBlank(gameId) && !isBlank(privateServerId)) {
        console.error("privateServerId requires gameId (4)");
        return 4;
    }

    if (!isBlank(serverId) && !isBlank(privateServerId)) {
        console.error("serverId requires to be 'null' to use privateServerId (4)");
        return 4;
    }

    if (!isBlank(linkCode) && !isBlank(gameId)) {
        console.error("gameId requires to be 'null' to use linkCode (4)");
        return 4;
    }

    if (!isBlank(linkCode) && !isBlank(privateServerId)) {
        console.error("privateServerId requires to be 'null' to use linkCode (4)");
        return 4;
    }

    return null;
}

function checkForBlankPreset(value, preset) {
    if (isBlank(value) || Object.keys(value).length === 0) {
        console.error(`Preset '${preset}' has no value, cannot continue (6)`);
        return 6;
    }

    return null;
}

module.exports = {
    optionsCombinationErrors,
    checkForBlankPreset
}