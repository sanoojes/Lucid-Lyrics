---
next:
  text: Screenshots
  link: ./screenshots
prev:
  text: Overview
  link: ./
---

# Getting Started

Welcome to **Lucid Lyrics** – a sleek and efficient lyrics extension for
**Spotify**, powered by **Spicetify**. With Lucid Lyrics, you can enjoy
synchronized lyrics with optional romanization support, customizable themes, and
precise timing adjustments – all while listening to your favorite tracks.

Follow this guide to quickly install and configure the extension, whether you
prefer using the Marketplace or building it from source.

## Prerequisites

Before proceeding, make sure you have the following installed:

- **Spotify** (Desktop version)

- [Spotify Installation Guide](https://www.spotify.com/de-en/download/)

- **Spicetify CLI** – A powerful tool for personalizing Spotify's interface
  and functionality
  - [Spicetify Installation Guide](https://spicetify.app/docs/getting-started)
- **Bun** – Required only if you plan to build Lucid Lyrics from source
  - [Bun Installation Guide](https://bun.sh)

## Installation Guide

You can install **Lucid Lyrics** through the Marketplace, download a pre-built
extension, or build it from source. Choose the method that suits you best.

### **Install via Marketplace**

1. Follow the
   [Marketplace installation guide](https://github.com/spicetify/marketplace/wiki/Installation)
   if you haven't set it up yet.
2. Open Spotify and go to the **Marketplace** section.
3. Navigate to the **Extensions** tab.
4. Search for **Lucid Lyrics** and click **Install**.

That's it! The extension will be enabled automatically.

### **Install from Pre-built Extension**

If you prefer not to build from source, you can download the pre-built extension
directly.

1. Download the latest release: [lucid-lyrics.js](https://lucid-lyrics.sanooj.uk/spice/lucid-lyrics.js)

2. Copy the file to your Spicetify extensions directory:

:::code-group

```bash [Linux/macOS]
cp lucid-lyrics.js ~/.config/spicetify/Extensions/
```

```powershell [Windows]
Copy-Item lucid-lyrics.js $env:APPDATA\spicetify\Extensions\
```

:::

1. Enable and apply:

```bash
spicetify config extensions lucid-lyrics.js
spicetify apply
```

### **Build from Source**

#### 1. Download the Extension

Clone or download the Lucid Lyrics repository:

```bash
git clone https://gitlab.com/sanoojes/lucid-lyrics.git
```

#### 2. Build the Extension

You can build the extension using `build` task. Extension will be saved to
`/dist` folder

```bash
bun run build
```

#### 3. Move the Extension

Copy the extension folder into Spicetify's extensions directory:

:::code-group

```bash [Linux/macOS]
cp -r dist/lucid-lyrics.js ~/.config/spicetify/Extensions/
```

```powershell [Windows]
Copy-Item -Recurse dist\lucid-lyrics.js $env:APPDATA\spicetify\Extensions\
```

:::

_(Use `spicetify config-dir` to quickly find your Spicetify configuration
folder._

- **Linux/macOS:** `~/.config/spicetify/`
- **Windows:** `%APPDATA%\spicetify\`\_

#### 4. Enable the Extension

You can enable the extension using these methods.

##### **Using the Command Line**

Run the following to activate the extension:

```bash
spicetify config extensions lucid-lyrics.js
```

##### **Manually Editing the Configuration**

Open the configuration file located at:

:::code-group

```bash [Spicetify]
spicetify config-dir
```

```bash [Linux/macOS]
~/.config/spicetify/config-xpui.ini
```

```powershell [Windows]
%APPDATA%\spicetify\config-xpui.ini
```

:::

Under the `[AdditionalOptions]` section, add or update this line:

```ini
[AdditionalOptions]
extensions = lucid-lyrics.js
```

Note: Append the `lucid-lyrics.js` to `extensions`

#### 4. Apply the Changes

To finalize the installation and see the effects, run:

```bash
spicetify apply
```

Now you can enjoy synced lyrics while listening to your favorite tracks!

Here's the updated **How to Use** section with clearer instructions and improved
formatting:

## How to Use ?

1. Open **Spotify** and play any track.
2. Click on the **lyrics icon** in the playbar or the "Now Playing" sidebar
   (right panel) to view the lyrics.
3. Open the settings by clicking your **profile picture** in the top bar and
   selecting **Lucid Lyrics Settings**.
4. Use the settings menu to:
   - Adjust the background theme (animated, static or solid color),
   - Customize Widget theme,
   - Toggle romanized lyrics on or off.
   - and more...
5. Sit back and enjoy as the lyrics highlight lines and words in real time,
   perfectly synced with the music.

Happy listening and enjoy your lyrics perfectly! 🎧📜
