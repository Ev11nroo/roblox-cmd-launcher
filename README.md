# Launch Roblox Player via a Terminal

Launch into a game of your choice with (basically) the same way as the website/app does it

[barebones](https://github.com/Ev11nroo/robloxlaunch-via-terminal/tree/barebone) branch is available

~~it works somehow and also very messy~~

## Usage

After everything is filled out, open a terminal (ex. Command Prompt) into the directory (with `cd`), and type `node index.js` to run the program.

Open another terminal to where your Roblox Player installation is (not Studio!) and type in the executable name.

- This will be `RobloxPlayerBeta.exe`
- For Linux users, this may be a PATH executable (Example: `vinegar player run` or `flatpak run org.vinegarhq.Vinegar player run`)

Copy your "play token" from the first terminal (`CTRL+SHIFT+C`) and paste into the second terminal. (`CTRL+SHIFT+V`) Then run it.

- Your play token will look something like this: `roblox-player:1+launchmode:play+gameinfo:authentication-ticket+launchtime:1706481700+placelauncherurl:https%3A%2F%2Fassetgame.roblox.com%2Fgame%2FPlaceLauncher.ashx%3Frequest%3DRequestGame%26browserTrackerId%3Dwhatever%26placeId%3D6243699076%26isPlayTogetherGame%3Dfalse%26joinAttemptId%3Dwhatever%26joinAttemptOrigin%3DPlayButton+browsertrackerid:whatever+robloxLocale:en_us+gameLocale:en_us+channel:`

After that, Roblox should run with your game opening successfully!

## Installation

This project requires [node.js](https://nodejs.org/en/download) to use.

Clone this repository with `git` or by downloading the ZIP file.

Open the directory, and then open `config.json`

At this point, you should see in a text editor:

```
{
    "replicate": false,
    "cookie": "your-roblox-cookie",
    "gameId": "any-game-id",
    "browserTrackerId": "your-browser-tracker-id",
    "joinAttemptId": "whatever-you-want"
}
```

You will need to fill out these fields.

### Getting your Roblox Cookie

***Warning: Sharing your cookie with anyone can make your account assesable to anyone.***

You can get your cookie in a browser by: `Right Click on Page > Inspect > Network` and refresh the page.

+ Then, click anything inside the `Name` column (that isn't a picture), scroll down in `Headers` until you see `Cookie:`. Copy everything inside and paste in `config.json`.

![Screenshot of a request's headers, showing where your Roblox cookie is found](/cookie-example.png)

### Getting a Game ID

In a browser with the page of your game of choice, copy the chunck of numbers at the top of the URL.

- Example: With the game [Brookhaven](https://www.roblox.com/games/4924922222/Brookhaven-RP), the link of the game is `https://www.roblox.com/games/4924922222/Brookhaven-RP`. You will want to copy `4924922222` in the URL.

### Getting your Browser Tracker ID (Optional)

Your browser tracker ID can be found in your cookie, or in the "play token" itself.

Since this is optional, and will still launch with an invalid ID, details will not be provided.

### Getting a Join Attempt ID (Optional)

Currently, there is no known way to generate a `joinAttemptId`. However, it can litteraly be anything and it will still launch.

### Replicate Option

If `true`, the program will replicate the requests that Roblox does when joining a game.

If `false`, the program will make requests that are only required to get a "play token".

This will not affect your final "play token".

Set to `false` by default.

### Write to File Option

If `true`, your "play token" will be written to `playtoken.txt`

If `false`, your "play token" will be simply displayed to copy from.

Set to `false` by default.
