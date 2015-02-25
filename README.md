# SYSTEM SETUP

My web dev setup
Maybe one day there'll be dot files...

# RSA Key

cd ~/.ssh; ssh-keygen -t rsa -C "your_email@example.com"; ssh-add id_rsa

Mac Settings
============
- Turn dock hiding on/off
- Turn off 'Windows Space' to get into spotlight
- View hidden files:
- 
```
defaults write com.apple.finder AppleShowAllFiles TRUE; killall Finder
```

Homebrew and Cask
============

Start off by installing Homebrew (instructions [here](http://brew.sh/) )

[RVM](https://rvm.io/)

[XCode](https://developer.apple.com/xcode/)

And the cask
```
brew tap phinze/homebrew-cask; brew install brew-cask

```
Now install all your programs.
If you need to search for your apps use:

$ brew cask search <your-app>

```
brew doctor
brew update
brew upgrade
brew install brew-cask
brew install tree
brew install git
brew install hub
brew cask install alfred
brew cask install atom
brew cask install boot2docker
brew cask install dropbox
brew cask install firefox
brew cask install flux
brew cask install google-chrome
brew cask install google-drive
brew cask install heroku-toolbelt
brew cask install iterm2
brew cask install istat-menus
brew cask install little-snitch
brew cask install rescuetime
brew cask install spotify
brew cask install vagrant
brew cask install virtualbox
brew install node
brew install phantomjs
brew install python
brew install casperjs
brew install android-sdk
brew install bradp/vv/vv
sudo npm install -g yo coffee-script haml sass compass foundation 
pip install stackit
```

yo installs bower, grunt-cli

 quick note on getting errors running npm without sudo. Make sure you own npm, or install with homebrew: [SO question on ](http://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo)

Link alfred:
```
brew cask alfred link
```
If you'd rather have the apps in Applications instead of linked, open an app and move it to the "Applications" folder, and make sure it stops asking you about that

### [Composer](https://getcomposer.org)
Installation
```
brew update
brew tap homebrew/dupes
brew tap homebrew/php
brew install composer
```
I needed to install php53-56. Had to run `brew install php53 php54 php55 php56`. Ran into issues and had to run `sudo chown -R `whoami` /usr/local` followed by  `brew link libtool`

### YoGuBo

Yeoman / Grunt / Bower

```
npm install -g grunt-cli
npm install -g grunt-init
```

# [Vagrant](https://github.com/Varying-Vagrant-Vagrants/VVV)
```
cd ~/Sites
hub clone Varying-Vagrant-Vagrants/VVV vvv
```

Bash profile:
```bash
alias v='vagrant'
```

## [Variable VVV](https://github.com/bradp/vv)
Set the default path in ~/.vv-config to the Sites dir. When you use `vv`, it will prompt you for the directory

# [Atom](https://atom.io)
I like [Atom](https://atom.io) because it is made for devs who just want to get going. The out of the box features and customizability encompass the ideals that every IDE strives to provide to its user base. 

I used Sublime Text for a while, but Atom operates closer to the terminal. You can do a lot more through key commands and the stuff I care about (terminal functionality, package mangement, git integration) is baked in with zero configuration needed. 

[Shortcut cheatsheet](https://bugsnag.com/blog/atom-editor-cheat-sheet)
```
apm install auto-update-packages emmet file-icons resize-panes atom-color-highlight color-picker todo-show autocomplete-plus tabs-to-spaces language-jade linter vertical-align
```

## Atom Config
Add the following to the Atom config file in  `Atom > Open Your Config`
```
'editor':
  'invisibles': {}
  'softWrap': true
  'tabLength': 2
  'tabs-to-spaces':
    'onSave': 'untabify'
```

## Init
Add the following to the Atom init file in `Atom > Open Your Init Script`
```
# Add semicolon at end of line
editor = atom.workspace.getActiveEditor()tom.workspaceView.command 'custom:semicolonize', ->
  editor.moveToEndOfLine()
  editor.insertText(";\n")
```

## Keymapping
Add the following to the Atom keymap file in `Atom > Open Your Keymap`
```
# Add semicolon to end of line wiht Alt + Enter
'.editor:not(.mini)':
  'alt-enter': 'custom:semicolonize'
```

# iTerm

Load the themes:
- Iterm > Preferences > Profiles > Colors
- Under Load Presets > Import 
- Select all of the color schemes
- Select the default profile
- Select the color scheme you want
- _Themes from https://github.com/mbadolato/iTerm2-Color-Schemes_

Set the hotkey:
- In Iterm > Preferences > Keys
- Set the 'Show/Hide iTerm with a system-wide hotkey' to Apple+Space
- Set the color scheme (Zenburn-hotkey) for this profile

Chrome
============

Extensions:
- Colorzilla
- [Developer Tools Dark Theme](http://howchoo.com/g/tell-chrome-developer-tools-to-use-a-dark-theme)
- Vimium
- GTasks
- MeasureIt
- Window Resizer
- OneTab
- Instrumente
- [Visual Event](http://www.sprymedia.co.uk/article/Visual+Event+2)
- [Markdown Reader](https://chrome.google.com/webstore/detail/markdown-reader/gpoigdifkoadgajcincpilkjmejcaanc/details?hl=en) (make sure to enable 'Allow File URLs' through chrome://extensions

Sublime Text 2
============

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

Git Aliases
============

Bash profile:
```bash
alias g='git'
```

Either add these to .git/config for your individual project, or to your global git configuration file (~/.gitconfig) or with: `git config --global --edit`

See .gitconfig

All commands can be used with arguments. For example, the `po` and `pu` commands can be followed by the branch that you want to push/pull, and the `ci` command can be followed by your commit message.

GitHub
============

Add the [SSH key](https://github.com/settings/ssh)
- Copy with: pbcopy < ~/.ssh/id_rsa.pub

## Github Shinies for changing assignee, label, and milestone through commit messages ##
- (from http://www.reigndesign.com/blog/adding-labels-and-re-assigning-github-issues-via-commit-message/)
- heroku login
- git clone git@github.com:joshrendek/github-postcommit-shinies.git; cd github-postcommit-shinies; sudo gem install heroku bundler; bundle install
- Bundle might need a ton of other gems. If it doesn't, you can throw this next section of commands onto the previous and do the whole shebang in one go
- git add Gemfile.lock; git commit -m 'Gemfile lock'; heroku create --stack cedar; git push heroku master; heroku ps
- Now go to the Admin page of your Github repository and click on the Service Hooks button on the left menu then click on the Post-Service-URLs button and paste your Heroku URL of your app and click the Update Settings button. Done!

Use with =user and ~label


AMPPS
===
- [Download](http://www.ampps.com/download)
- Turn on the Apache server and go to [http://localhost/ampps](http://localhost/ampps)
- Make a new domain (such as mysite.dev)
- Select that it is an addon domain, use the full filepath for the domain (/Users/me/Sites/mysite), under Advanced: add an entry to the host file
- Default DB user is 'root' with password: 'mysql'
- Use mysql from the command line:
```bash
export PATH="/Applications/AMPPS/mysql/bin:$PATH"
```

# VIM

Copy the .vimrc file to ~

## [Vundle](https://github.com/gmarik/Vundle.vim)

Follow the [quick start instructions](https://github.com/gmarik/Vundle.vim#quick-start)

### Non-Vundle packages

[WP Cli](http://wp-cli.org/)
===
```
curl -L https://raw.github.com/wp-cli/builds/gh-pages/phar/wp-cli.phar > wp-cli.phar; chmod +x wp-cli.phar; sudo mv wp-cli.phar /usr/bin/wp
```

Test with `wp`

## [Bash completion](https://github.com/wp-cli/wp-cli/raw/master/utils/wp-completion.bash)

## Errors with LAMP stacks:

- See [this FAQ item on setting up with MAMP](https://github.com/wp-cli/wp-cli/wiki/FAQ#error-cant-connect-to-the-database)
- For AMPPS: you must set the PHP version to 5.4 or higher, and setup a symlink for the PHP binary:
```bash
sudo mv /usr/bin/php /usr/bin/php-backup
sudo ln -s /Applications/AMPPS/php/bin/php /usr/bin/php
```

Key Remap
============
[KeyRemap4MacBook](https://pqrs.org/macosx/keyremap4macbook/)

- Decrease the key repeat
- Open up the settings, get to the private.xml, replace it with this custom one (keymap/private.xml)
- Back in the Change Key tab click ReloadXML. The custom definitions will be at the top

# Bigger Notes Dashboard Widget

Provides a bigger note-taking space in the Dashboard

https://github.com/fauria/bigger-notes
