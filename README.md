# SYSTEM SETUP

My computer setup, with a heavy dose of web dev tools and features.

I'm still working on this. Hopefully someday all these steps will be in one bash file that will setup everything in a few minutes without any human intervention

Maybe one day there'll be dot files...

NOTE: Watch out for `newmachinename`. This should be replaced with the name of the new machine.

# Setup folders

```
mkdir ~/Sites
```

# RSA Key

change `your_email@example.com` to whatever you use on services that require your SSH key.

cd mkdir -p ~/.ssh && ~/.ssh && ssh-keygen -t rsa -C "your_email@example.com" && ssh-add id_rsa

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

# [XCode](https://developer.apple.com/xcode/) 

XCode must be installed through the App Store

# Symlinking Important Config Files to Google Drive

Maybe I'll change this one day, or add it to the big script, but for now, I create symbolic links for my important config and settings files to Google Drive since it has auto backup and revision history.

```
# Atom
rm ~/.atom/config.cson ~/.atom/keymap.cson ~/.atom/styles.less ~/.atom/init.coffee ~/.atom/snippets.cson
ln -s $PWD/atom/config.cson ~/.atom/config.cson
ln -s $PWD/atom/keymap.cson ~/.atom/keymap.cson
ln -s $PWD/atom/styles.less ~/.atom/styles.less
ln -s $PWD/atom/init.coffee ~/.atom/init.coffee
ln -s $PWD/atom/snippets.cson ~/.atom/snippets.cson

# Bash Profile
rm ~/.bash_profile
ln -s ~/Google\ Drive/My-Programming/.bash_profile ~/.bash_profile 

# Git 
## Auto complete
ln -s $PWD/git/git-completion.bash ~/git-completion.bash
## Configuration
ln -s $PWD/git/.gitconfig ~/.gitconfig

# Sequel Pro Favorites
# TODO: Linking from Google Drive has no impact because Sequel Pro doesn't update the file, it replaces it
# rm ~/Library/Application\ Support/Sequel\ Pro/Data/Favorites.plist 
# ln -s ~/Google\ Drive/My-Programming/Favorites-sqlpro.plist ~/Library/Application\ Support/Sequel\ Pro/Data/Favorites.plist 
ln -s ~/Library/Application\ Support/Sequel\ Pro/Data/Favorites.plist ~/Google\ Drive/My-Programming/Favorites-sqlpro-newmachinename.plist 
ln -s ~/Library/Application\ Support/Sequel\ Pro/Data/Favorites.plist ~/Google\ Drive/My-Programming/Favorites-sqlpro-newmachinename.plist

# Karabiner - key remapping and speeding up the keystroke delay
# @see https://pqrs.org/macosx/keyremap4macbook/
sudo rm /Applications/Karabiner.app/Contents/Resources/private.xml && sudo ln -s $PWD/karabiner/private.xml /Applications/Karabiner.app/Contents/Resources/private.xml

#TODO:
# gitconfig
# [Variable VVV](https://github.com/bradp/vv) : Set the default path in ~/.vv-config to the Sites dir. When you use `vv`, it will prompt you for the directory
# .vimrc
```

# Other methods of installing these tools

## [Composer](https://getcomposer.org)

Trying to install Composer with Brew caused issues for me. If you want to do composer try this:

```
brew tap homebrew/dupes
brew tap homebrew/php
brew install composer
```

I needed to install php53-56. Had to run `brew install php53 php54 php55 php56`. Ran into issues and had to run `sudo chown -R `whoami` /usr/local` followed by  `brew link libtool`

## PHP

Since `PHP` is symbolically linked to a specific version, you can't install multiple versions at the same time. To install different versions, just change the number where it is MAJORVERSION MINORVERSION (so: 5.6 is 56, 5.3 is 53, etc)

```
# Install PHP version 5.3
brew install php53
```

# Application Settings

## Alfred

- Color scheme: dark
- anything else?

## Chrome

- Set the default: System Preferences > General > Default Web Browser
- Extensions are stored in the cloud so they are downloaded as soon as you log in.
- To enable the "Hold Cmd + Q to quit" option: Under Chrome in the toolbar, select "Warn Before Quitting"

## Commander One

- View hidden files

View

- Show full file name

Appearance

- Theme: Novel

## iTerm

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

## Karabiner

Open up the settings (open Karabiner with Alfred), Under the 'Change Key' menu click the 'Reload XML' button

Under Basic Configuration > Key repeat

- Delay Until Repeat: 100ms
- Key Repeat: 13ms

## Scripts

A selection of useful automation tasks like pausing YouTube located in /scripts. Can be added to Alfred if you have workflows, or saved run from Spotlight

Run them from the terminal by adding an alias to your .bash_profile file (where SCRIPTS_PATH is the path to the script file):

alias youtubepauseplay='osascript '$SCRIPTS_PATH'/youtube_play_pause.scpt'

Props to [zach loubier](https://gist.github.com/zachloubier/9b07fd21292a7dfb92d9) for the scripts that control YouTube from the command line. They assume that you are using Google Chrome. Update to your fav browser.

## SSH Keys

Copy the public ssh key

```
pbcopy < ~/.ssh/id_rsa.pub
```

Add the SSH Key to all of your accounts:

- [BitBucket](https://bitbucket.org/account/user/azanebrain/ssh-keys/)
- [GitHub](https://github.com/settings/ssh)
- [GitLab](https://gitlab.com/profile/keys/new)

## Spectacle

- Run: as a background service

## System Preferences

Change CAPS Lock and Ctrl

- Open up System Preferences -> Keyboard
- Open the Modifier Keys menu
- Fight off that carpel tunnel

# IDE / Text Editor

## Visual Studio Code 

I got into VS Code for the TypeScript support, but stayed because it's awesome

Symlink the settings JSON file:

```
# Mac
ln -s $PWD/vscode/settings.json ~/Library/Application\ Support/Code/User/settings.json
# Ubuntu
ln -s $PWD/vscode/settings.json ~/.config/Code/User/settings.json
```

Extensions are stored in this repo so I don't need to reinstall them all the time. 

Symlink the extensions directory:
```
ln -s  $PWD/vscode/extensions ~/.vscode/
```

### Fonts

I really like Programming Ligatures (things like === becoming a three-line symbol)

See [this article by Scott Hanslman](https://www.hanselman.com/blog/MonospacedProgrammingFontsWithLigatures.aspx) for a convincing rundown of using monospaced programming ligatures and setting them up in VSCode. The only step not mentioned is that you need to install the font file

## [Atom](https://atom.io)

I like [Atom](https://atom.io) because it is made for devs who just want to get going. The out of the box features and customizability encompass the ideals that every IDE strives to provide to its user base.

I used Sublime Text for a while, but Atom operates closer to the terminal. You can do a lot more through key commands and the stuff I care about (terminal functionality, package management, git integration) is baked in with zero configuration needed. That being said, I still jump between the two every few months...

[Shortcut cheatsheet](https://bugsnag.com/blog/atom-editor-cheat-sheet)

## Sublime Text 2

Settings: Copy the Preferences.sublime-settings into the user settings ( command + , )

Package Manager
https://sublime.wbond.net/installation

Need to find a JS/Coffeescript linter

- Emmet
- [Git Gutter](https://github.com/jisaacks/GitGutter)
- Syntax Highlighting for Sass
- - (enable with: View -> Syntax -> Syntax Highlighting for Sass)
- Sublime FTP
- - (create a connection by saving the file to:
- Search WordPress Codex
- WordPress (by purplefish32)
- Zen Tabs
- [SublimeLinter](https://github.com/SublimeLinter/SublimeLinter-for-ST2)
- [Sublime Alignment](http://wbond.net/sublime_packages/alignment)
- [Clipboard History](https://github.com/kemayo/sublime-text-2-clipboard-history)

- [Syntax highlighting for CoffeeScript, Jade, Stylus](https://gist.github.com/liamdon/2467603)
```bash
cd ~/Library/Application\ Support/Sublime\ Text\ 2/Packages
git clone git://github.com/jashkenas/coffee-script-tmbundle CoffeeScript
git clone https://github.com/miksago/jade-tmbundle.git Jade
git clone https://github.com/LearnBoost/stylus.git Stylus
```

- Activate Subl
- - (make sure ~/bin has been created)
```
sudo ln -s "/opt/homebrew-cask/Caskroom/sublime-text/2.0.2/Sublime Text 2.app/Contents/SharedSupport/bin/subl" ~/bin/subl
```
This won't work until your add this to your .bash_profile file:
```
export PATH=$PATH:~/bin
```
And restart the terminal

### End of Line Semi Colon

Use: super + enter

Setup: Add the eolsemicolon.sublime-macro file to the Packages directory. Open it by going to Preferences > Browse Packages, this will open up a window with a list of package directories. Go to the User folder and add the End of Line Semicolon macro file there

Copy the contents of the keymap file (to Default (OSX).sublime-keymap) to the user keybindings (Preferences > Key Bindings - User), or copy the file to the same Packages directory as the macro file.

========================================================================================================

## Github Shinies for changing assignee, label, and milestone through commit messages

I never got this working... does this work?

- (from http://www.reigndesign.com/blog/adding-labels-and-re-assigning-github-issues-via-commit-message/)
- heroku login
- git clone git@github.com:joshrendek/github-postcommit-shinies.git; cd github-postcommit-shinies; sudo gem install heroku bundler; bundle install
- Bundle might need a ton of other gems. If it doesn't, you can throw this next section of commands onto the previous and do the whole shebang in one go
- git add Gemfile.lock; git commit -m 'Gemfile lock'; heroku create --stack cedar; git push heroku master; heroku ps
- Now go to the Admin page of your Github repository and click on the Service Hooks button on the left menu then click on the Post-Service-URLs button and paste your Heroku URL of your app and click the Update Settings button. Done!

Use with =user and ~label

# AMPPS

I don't use AMPPS anymore. I prefer spinning up a quick environment in Vagrant. But if you're in the kind of situation or time crunch were you really can't take the 40 minutes to setup a new Vagrant environment, hopefully this will help:

- [Download](http://www.ampps.com/download)
- Turn on the Apache server and go to [http://localhost/ampps](http://localhost/ampps)
- Make a new domain (such as mysite.dev)
- Select that it is an addon domain, use the full filepath for the domain (/Users/me/Sites/mysite), under Advanced: add an entry to the host file
- Default DB user is 'root' with password: 'mysql'
- Use mysql from the command line:
```bash
export PATH="/Applications/AMPPS/mysql/bin:$PATH"
```

## Errors with LAMP stacks:

- See [common issues](http://wp-cli.org/docs/common-issues/) and [this FAQ item on setting up with MAMP](http://wp-cli.org/#mamp)
- For AMPPS: you must set the PHP version to 5.4 or higher, and setup a symlink for the PHP binary:
```bash
sudo mv /usr/bin/php /usr/bin/php-backup
sudo ln -s /Applications/AMPPS/php/bin/php /usr/bin/php
```
