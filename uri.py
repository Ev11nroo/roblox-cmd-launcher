import json
import time

config = json.load(open("config.json"))
cookie = config["cookie"]
writeToFile = config["writeToFile"]
command = config["command"]

def createUri(authTicket, privateServerAccessCode, friendId, gameId, serverId):
    unixtime = round(time.time())

    initalUri = f"roblox-player:1+launchmode:play+launchtime:{unixtime}+"
    placeLauncherUrl = f"https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGame&placeId={gameId}&"

    if (cookie != None) or (authTicket != None):
        initalUri += f"gameinfo:{authTicket}+"

    print(initalUri)
    return