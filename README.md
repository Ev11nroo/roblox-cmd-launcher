# Launch Roblox Player via a Terminal

Launch into a game of your choice with (basically) the same way as the website/app does it

~~it works somehow~~

## Usage

After everything is filled out, open a terminal (ex. Command Prompt) into the directory (with `cd`), and type `node index.js` to run the program.

Open another terminal to where your Roblox Player installation (not Studio!) and type in the executable name.

Copy your "play token" from the first terminal (`CTRL+SHIFT+C`) and paste into the second terminal. (`CTRL+SHIFT+V`)

After that, Roblox should run with your game opening successfully!

## Installation

This project requires [node.js](https://nodejs.org/en/download) to use.

Clone this repository with `git` or by downloading the ZIP file.

Open the directory, and then open `config.json`

At this point, you should see in a text editor:

```
{
    "cookie": "your-roblox-cookie",
    "gameId": "any-game-id",
    "browserTrackerId": "your-browser-tracker-id",
    "joinAttemptId": "whatever-you-want"
}
```

You will need to fill out these fields.

### Getting your Roblox Cookie

***Warning: Sharing your cookie with anyone can make your account assesable to anyone.***

You can get your cookie in a browser: `Right Click on Page > Inspect > Network` and refresh the page.

+ Then, click anything inside the `Name` column (that isn't a picture), scroll down in `Headers` until you see `Cookie:`. Copy everything inside and paste in `config.json`.

### Getting a Game ID

In a browser with the page of your game of choice, copy the chunck of numbers at the top of the URL.

- Example: With the game [Brookhaven](https://www.roblox.com/games/4924922222/Brookhaven-RP), the link of the game is `https://www.roblox.com/games/4924922222/Brookhaven-RP`. You will want to copy `4924922222` in the URL.

### Getting your Browser Tracker ID (Optional)

Your browser tracker ID can be found in your cookie, or in the "play token" itself.

Since this is optional, and will still launch with an invalid ID, details will not be provided.

### Getting a Join Attempt ID (Optional)

Currently, there is no known way to generate a `joinAttemptId`. However, it can litteraly be anything and it will still launch.
