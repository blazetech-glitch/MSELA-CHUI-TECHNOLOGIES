# Run the bot locally (no Heroku dyno)

This guide runs the WhatsApp **bot worker** on your own PC or Android phone. The Heroku app's `SESSION_ID` setting does not automatically transfer to your device; you will enter your own session value in a local, ignored file.

## Before you start

- The project requires **Node.js 20.9.0 or newer** and starts with `npm start`.
- Keep the bot running on **one device at a time**. The Heroku worker is currently stopped, so it will not compete with a local run.
- Keep your session private. Do not commit or send `settings.env`, session credentials, or WhatsApp auth files. The repository ignores `settings.env` and the auth directories.
- The bot can run with its local JSON database fallback; no paid Heroku dyno or hosted database is needed for a local run. Keep a backup of `blaze-data.json` if you care about local bot data.

## Recommended: Windows, macOS, or Linux PC

### 1. Install Node.js and Git

Install the current Node.js LTS release from [nodejs.org](https://nodejs.org/en/download/) and install Git if it is not already available. Open a new PowerShell, Terminal, or shell window and verify:

```sh
node --version
npm --version
```

The Node version must be at least `20.9.0`.

### 2. Download the project

This branch contains the current Heroku web/status-page addition as well as the bot code:

```sh
git clone --branch feat/zenith-heroku-status https://github.com/blazetech-glitch/MSELA-CHUI-TECHNOLOGIES.git
cd MSELA-CHUI-TECHNOLOGIES
npm ci
```

If you use Windows without Git, download the branch ZIP from the repository page and open a terminal in the extracted project folder before running `npm ci`.

### 3. Add your session locally

Create `settings.env` in the project root:

- **Windows:** run `notepad .\settings.env`, create the file if prompted, and save it as UTF-8.
- **macOS/Linux:** run `nano settings.env`.

Put one line in the file, replacing the placeholder with the complete session value:

```dotenv
SESSION_ID="PASTE_YOUR_FULL_SESSION_ID_HERE"
```

Keep the double quotes around the whole value. This is especially important if the session contains `#`, which otherwise may be parsed as a comment. Do not add spaces around `=`. The file is ignored by Git, but do not force-add it.

If the bot's owner/admin commands do not recognize you, you may also set your WhatsApp number in international format:

```dotenv
NUMERO_OWNER=YOUR_COUNTRY_CODE_AND_NUMBER
```

### 4. Start and stop the bot

From the project folder, run:

```sh
npm start
```

Leave that terminal open and the PC powered on and connected to the internet. Stop the bot with **Ctrl+C**. To start it again, return to the project folder and run `npm start` again.

The bot connects to the WhatsApp account represented by the session and may act on incoming chats according to the project's configured commands and defaults. Review its behavior before leaving it unattended.

## Android (Termux; experimental for this project)

Termux can run Node.js locally, but this project depends on the native `sharp` image library. Its published prebuilt binaries cover common desktop/server platforms, not Android/Termux, so installation may fail there. If `npm ci` fails on `sharp` or another native module, use the PC route rather than applying random binary workarounds.

### 1. Install Termux

Install Termux from [F-Droid](https://f-droid.org/packages/com.termux/) or the official [Termux GitHub releases](https://github.com/termux/termux-app). Do not mix Termux or plugin APKs from different sources; their signing keys differ. The official project lists full app/package support for Android 7 and newer.

### 2. Install Node.js and Git

In Termux, run:

```sh
pkg update -y && pkg upgrade -y
pkg install -y nodejs-lts git
node --version
npm --version
```

Termux's Node.js package guide lists `nodejs-lts` as an installable package: [Termux Node.js guide](https://wiki.termux.com/index.php?title=Node.js).

### 3. Download, install, and configure

```sh
git clone --branch feat/zenith-heroku-status https://github.com/blazetech-glitch/MSELA-CHUI-TECHNOLOGIES.git
cd MSELA-CHUI-TECHNOLOGIES
npm ci
nano settings.env
```

In the editor, add the same quoted line shown above, using your own complete session value:

```dotenv
SESSION_ID="PASTE_YOUR_FULL_SESSION_ID_HERE"
```

Save in nano with **Ctrl+O**, press **Enter**, then exit with **Ctrl+X**. Start it with:

```sh
npm start
```

Keep Termux open, the phone plugged in if possible, and the phone connected to the internet. In Android settings, set Termux's battery usage to **Unrestricted** / exclude it from battery optimization (the wording varies by phone). Android may still stop background processes, so a phone is less reliable for continuous operation than a PC.

## Local web/status page (optional)

The WhatsApp worker does not need the web page. If you also want to view the status page locally, open a second terminal in the project folder and run:

```sh
PORT=3000 node web.js
```

Open `http://127.0.0.1:3000/` on the same device. This is a **local-only** address, not a public internet URL.

## Troubleshooting

- **`node` or `npm` not found:** reinstall Node.js, open a new terminal, then check `node --version` again.
- **`npm ci` fails on Android:** this is likely a Termux/native-dependency compatibility issue; use a PC.
- **The bot cannot connect:** check that `settings.env` is in the project root, that the `SESSION_ID` line is quoted, and that the session is still valid. If necessary, generate a fresh session using the project's [pairing page](https://msela-chui-xmd-pair-site.onrender.com/).
- **Do not share raw logs containing session strings, phone numbers, or auth credentials.** Redact those values before asking for help.

## References

- [Project package requirements and scripts](https://github.com/blazetech-glitch/MSELA-CHUI-TECHNOLOGIES/blob/feat/zenith-heroku-status/package.json)
- [Termux installation guidance](https://github.com/termux/termux-app#installation)
- [Termux Node.js package guide](https://wiki.termux.com/index.php?title=Node.js)
- [sharp supported platforms and installation](https://sharp.pixelplumbing.com/install/)
