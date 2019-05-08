This document has MacOS-specific instructions

# Homebrew
This awesome tool will let you install so much awesome stuff directly from the terminal.

Follow the instructions to [install Homebrew](http://brew.sh/) (with curl).

Follow this up with installing [RVM](https://rvm.io/) because you'll probably need it in the future.

And then Cask, the homebrew tool to install desktop applications (like Chrome, Alfred, iTerm, DropBox, etc)

```
brew tap phinze/homebrew-cask && brew install brew-cask
```

Now install all your programs.

If you need to search for your apps use:

```
brew cask search <your-app>
```

```
# Even though we just installed brew, update it
brew doctor
brew update
brew upgrade
# Now install all our cool tools and applications
brew install tree
brew install git
brew install hub
# PHP
# To install other version of PHP scroll down to the PHP section
brew tap homebrew/dupes
brew tap homebrew/php
brew install php56
# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/bin/
# Desktop tools
brew cask install alfred
# Sorry Atom! I use VSCode now... :c
# brew cask install atom
brew cask install boot2docker
brew cask install commander-one
brew cask install dropbox
brew cask fetch electric-sheep
brew cask install firefox
brew cask install flux
brew cask install google-chrome
brew cask install google-drive
brew cask install heroku-toolbelt
brew cask install hipchat
brew cask install iterm2
brew cask install istat-menus
brew cask install karabiner
brew cask install licecap #gif screenrecording
brew cask install little-snitch
brew cask install rescuetime
brew cask install postman
brew cask install sequel-pro
brew cask install skype
brew cask install slack
brew cask install spectacle
brew cask install spotify
brew cask install vagrant
brew cask install virtualbox
brew cask install visual-studio-code
brew cask install vlc
brew install node
# Run npm globally without sudo. See: http://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo
mkdir -p ~/.npm
sudo chown -R `whoami` ~/.npm
sudo chown -R `whoami` /usr/local/lib/node_modules
# Add NVM (node version manager)
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
# Set the default version of node to the most recent LTS
nvm alias default 6.6.0 
# Back to what we were doing:
brew install phantomjs
brew install python
brew install casperjs
brew install android-sdk
brew install bradp/vv/vv

# Node packages
npm install -g bower caniuse-cmd coffee-script compass foundation grunt grunt-cli haml localtunnel sass tsd typescript yo

# Ruby Gems
gem install bundler

# Vagrant
vagrant plugin install vagrant-hostsupdater
vagrant plugin install vagrant-triggers

# WP Cli
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

# Configure Apps

# Enable https as default for Hub
git config --global hub.protocol https

# Install Atom Packages
apm install atom-ternjs atom-typescript auto-update-packages docblockr emmet file-icons color-picker git-plus todo-show tabs-to-spaces language-jade language-typescript linter merge-conflicts project-manager vertical-align

# Other cli tools

# [StackIt](https://github.com/lukasschwab/stackit)
# The essential sidekick to any superhero developer.
# stackit sends smart StackOverflow queries from your command line.
# stackitfor.me -- Created at SB Hacks 2015.
pip install stackit
# Install applications that require a password (all have already been fetched)
brew cask install electric-sheep

# Link the Alfred download path with brew-cask so you can use Alfred to open programs installed with brew
# "Good news as of v2.6 Alfred now has first-cass support for casks out of the box"
# brew cask alfred link

# TODO:
# [Vundle](https://github.com/gmarik/Vundle.vim): Follow the [quick start instructions](https://github.com/gmarik/Vundle.vim#quick-start)
# [WP-CLI Bash completion](https://github.com/wp-cli/wp-cli/raw/master/utils/wp-completion.bash)

# Open some programs that need you to authorize their security requirements
open ~/Applications/Alfred\ 2.app
open ~/Applications/Dropbox.app
open ~/Applications/Google\ Drive.app
open /Applications/Karabiner.app
open ~/Applications/Spectacle.app

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
    
# View hidden files in the Finder
defaults write com.apple.finder AppleShowAllFiles TRUE; killall Finder
# Set clock to 24 hour format
defaults write com.apple.menuextra.clock DateFormat -string 'EEE MMM d  H:mm'
# Set the screen saver time limit to 20min (1,200 seconds)
sudo defaults write /Library/Preferences/com.apple.screensaver loginWindowIdleTime 1200
# Set correct scroll direction
defaults write -g com.apple.swipescrolldirection -bool FALSE
# Increase mouse tracking speed
defaults write -g com.apple.mouse.scaling 3
# Increase scroll wheel speed
defaults write -g com.apple.scrollwheel.scaling -float 1
# Enable press and hold to decrease key repeat time 
defaults write -g ApplePressAndHoldEnabled -bool false
# TODO: Figure out if these commands had an impact after restarting
# Enable tap to click
defaults -currentHost write -globalDomain com.apple.mouse.tapBehavior -int 1

# Dock settings
# Autohide the dock
defaults write com.apple.dock autohide -bool true
# Only show active apps
defaults write com.apple.dock static-only -bool TRUE
# Show the hidden state of apps
defaults write com.apple.dock showhidden -bool TRUE
# Remove the Auto-Hide Dock Delay 
defaults write com.apple.dock autohide-time-modifier -float 1
killall Dock

# Restart the machine
sudo shutdown -r
```

# iTerm

TODO: Can these be symlinked?

Load the themes:
- Iterm > Preferences > Profiles > Colors
- Under Load Presets > Import
- Select all of the color schemes
- Select the default profile
- Select the color scheme (Monokai Soda / Solorized Dark / Neopolitan depending on my mood)
- _ Themes from https://github.com/mbadolato/iTerm2-Color-Schemes _

Set the hotkey:

- In Iterm > Preferences > Keys
- Set the 'Show/Hide iTerm with a system-wide hotkey' to Apple+Space
- Set the color scheme (Zenburn-hotkey) for this profile

# Karabiner

Open up the settings (open Karabiner with Alfred), Under the 'Change Key' menu click the 'Reload XML' button

Under Basic Configuration > Key repeat

- Delay Until Repeat: 100ms
- Key Repeat: 13ms

# Scripts

A selection of useful automation tasks like pausing YouTube located in /scripts. Can be added to Alfred if you have workflows, or saved run from Spotlight

Run them from the terminal by adding an alias to your .bash_profile file (where SCRIPTS_PATH is the path to the script file):

alias youtubepauseplay='osascript '$SCRIPTS_PATH'/youtube_play_pause.scpt'

Props to [zach loubier](https://gist.github.com/zachloubier/9b07fd21292a7dfb92d9) for the scripts that control YouTube from the command line. They assume that you are using Google Chrome. Update to your fav browser.

# [XCode](https://developer.apple.com/xcode/) 

XCode must be installed through the App Store
