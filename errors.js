function optionsCombinationErrors(gameId, privateServerAccessCode, friendId, serverId, privateServerId) {
    if (friendId != null && privateServerAccessCode != null) {
        console.error("privateServerAccessCode reqires to be 'null' to use friendId (5)");
        return 5;
    }

    if (friendId != null && serverId != null) {
        console.error("serverId requires to be 'null' to use friendId (6)")
        return 6;
    }

    if (serverId != null && privateServerAccessCode != null) {
        console.error("privateServerAccessCode requires to be 'null' to use serverId (7)");
        return 7;
    }

    if (privateServerAccessCode != null && privateServerId != null) {
        console.error("privateServerAccessCode requires to be 'null' to user privateServerId (9)");
        return 9;
    }

    if (gameId == null && privateServerId != null) {
        console.error("privateServerId requires gameId (10)");
        return 10;
    }
}

module.exports = {
    optionsCombinationErrors
}