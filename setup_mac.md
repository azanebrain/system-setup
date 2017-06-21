# Instructions for setting up a new Mac OS x machine

# Homebrew
This awesome tool will let you install so much awesome stuff directly from the terminal.

Follow the instructions to [install Homebrew](http://brew.sh/) (with curl).

Follow this up with installing [RVM](https://rvm.io/) because you\'ll probably need it in the future.

And then Cask, the homebrew tool to install desktop applications (like Chrome, Alfred, iTerm, DropBox, etc)

```
brew tap phinze/homebrew-cask && brew install brew-cask
```

Now install all your programs.

If you need to search for your apps use:

```
brew cask search <your-app>
```

Run `./scripts/setup-mac/programs-from-brew.sh` (but make sure you want everything in there first)

# Mac Settings
# TODO:
  - Turn dock hiding on/off
  - Enable the computer to run while closed
  - Turn off 'Windows Space' to get into spotlight
  - Set the display resolution
  - that app that lets me type fast
  - keyboard changes (caps lock)
  - add colemak keyboard
  - set function preference (hold `fn` key to use F# features)
  - show power charge number in menu bar
  - default apps at launch
  - dock on left side
  - dock items
  - dark style
  - hotkey to change desktop
  - file endings in finder browser
  - Programs on startup
    - Chrome
    - f.lux
    - hipchat
    - iTerm
    - Slack
    - Spectacle

Run `./scripts/setup-mac/mac-settings.sh` (but make sure you want everything in there first)
```    

```

# [XCode](https://developer.apple.com/xcode/) 

XCode must be installed through the App Store
