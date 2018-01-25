# SYSTEM SETUP

My computer setup, with a heavy dose of web dev tools and features.

I'm still working on this. Hopefully someday all these steps will be in one bash file that will setup everything in a few minutes without any human intervention

Maybe one day there'll be dot files...

NOTE: Watch out for `newmachinename`. This should be replaced with the name of the new machine.

NOTE: Watch out for any reference to `$PWD`. This is the path to the current directory. Certain instructions will have you redirect to a local directory which may be opinionated (such as `~/Sites` being my home for website projects)

# Setup folders
```
mkdir ~/Sites
```

# RSA Key

change `your_email@example.com` to whatever you use on services that require your SSH key.

cd mkdir -p ~/.ssh && ~/.ssh && ssh-keygen -t rsa -C "your_email@example.com" && ssh-add id_rsa

# Run Machine Setup Scripts

Depending on the environment you're working in, refer to the associated `setup_***.md` instructions.

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

Symlink the keybindings:
```
ln -s $PWD/vscode/keybindins.json ~/.config/Code/User/keybindings.json
```

Extensions are stored in this repo so I don't need to reinstall them all the time. 

Symlink the extensions directory:
```
ln -s  $PWD/vscode/extensions ~/.vscode/
```

Symlink the snippets directory:
```
ln -s  $PWD/vscode/snippets ~/.config/Code/User/
```

### Configuration

* Allow multiselect (Ubuntu): `gsettings set org.gnome.desktop.wm.preferences mouse-button-modifier "<Super>"`

### Fonts

I really like Programming Ligatures (things like === becoming a three-line symbol)

See [this article by Scott Hanslman](https://www.hanselman.com/blog/MonospacedProgrammingFontsWithLigatures.aspx) for a convincing rundown of using monospaced programming ligatures and setting them up in VSCode. The only step not mentioned is that you need to install the font file

## [Atom](https://atom.io)

I like [Atom](https://atom.io) because it is made for devs who just want to get going. The out of the box features and customizability encompass the ideals that every IDE strives to provide to its user base.

I used Sublime Text for a while, but Atom operates closer to the terminal. You can do a lot more through key commands and the stuff I care about (terminal functionality, package management, git integration) is baked in with zero configuration needed. That being said, I still jump between the two every few months...

[Shortcut cheatsheet](https://bugsnag.com/blog/atom-editor-cheat-sheet)

## [Redshift](http://jonls.dk/redshift/)

Redshift is Flux for Linux

Symlink the config file:

```
ln -s $PWD/redshift/redshift.conf ~/.config/redshift.conf
```

I've had problems with using a DisplayLink docking station, where all of the randr commands (like rotating the screens) don't work on the external monitors. This includes redshift :sad_panda:

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
