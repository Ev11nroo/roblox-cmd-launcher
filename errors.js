function optionsCombinationErrors(gameId, privateServerAccessCode, friendId, serverId, privateServerId) {
    if (friendId != null && privateServerAccessCode != null) {
        console.error("privateServerAccessCode reqires to be 'null' to use friendId (4)");
        return 4;
    }

    if (friendId != null && serverId != null) {
        console.error("serverId requires to be 'null' to use friendId (4)")
        return 4;
    }

    if (serverId != null && privateServerAccessCode != null) {
        console.error("privateServerAccessCode requires to be 'null' to use serverId (4)");
        return 4;
    }

    if (privateServerAccessCode != null && privateServerId != null) {
        console.error("privateServerAccessCode requires to be 'null' to use privateServerId (4)");
        return 4;
    }

    if (gameId == null && privateServerId != null) {
        console.error("privateServerId requires gameId (4)");
        return 4;
    }

    if (serverId != null && privateServerId != null) {
        console.error("serverId requires to be 'null' to use privateServerId (4)");
        return 4;
    }

    return null;
}

function checkForBlankPreset(value, preset) {
    if ((value == null) || (value == {}) || (value == "")) {
        console.error(`Preset '${preset}' has no value, cannot continue (6)`);
        return 6;
    }

    return null;
}

module.exports = {
    optionsCombinationErrors,
    checkForBlankPreset
}