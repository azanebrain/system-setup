system-setup
============

My web dev setup

Homebrew and Cask
============

Start off by installing Homebrew (instructions [here](http://brew.sh/) )
[RVM](https://rvm.io/)
[XCode](https://developer.apple.com/xcode/)

And the cask
$ brew tap phinze/homebrew-cask
Now install all your programs.
If you need to search for your apps use:

$ brew cask search <your-app>

```
brew install brew-cask
brew install tree
brew cask install google-chrome
brew cask install firefox
brew cask install google-drive
brew cask install dropbox
brew cask install alfred
brew cask install iterm2
brew cask install spotify
brew cask install sublime-text
brew install node
brew install phantomjs
brew install casperjs
sudo npm install -g yo coffee-script
sudo gem install haml sass compass foundation 
```

yo installs bower, grunt-cli

Link alfred:
```
$ brew cask alfred link
```
If you'd rather have the apps in Applications instead of linked, open an app and move it to the "Applications" folder, and make sure it stops asking you about that


### YoGuBo

Yeoman / Grunt / Bower

```
```

iTerm
============

Load the themes:
- Iterm > Prefernces > Colors
- Under Load Presets > Import 
- Select all of the color schemes
- Make a new Profile
- Select the color scheme you want
- Set it as default
- Go to the General tab and rename the profile
- _Themes from https://github.com/mbadolato/iTerm2-Color-Schemes_

Set the hotkey:
- In Iterm > Preferences > Keys
- Set the 'Show/Hide iTerm with a system-wide hotkey' to Apple+Space

Mac Settings
============
- Turn dock hiding on/off
- Turn off 'Windows Space' to get into spotlight


Chrome
============

Extensions:
- Colorzilla
- Vimium
- GTasks
- MeasureIt
- Window Resizer
- OneTab
- Instrumente
- [Visual Event](http://www.sprymedia.co.uk/article/Visual+Event+2)

Sublime Text 2
============

Package Manager
https://sublime.wbond.net/installation

Need to find a JS/Coffeescript linter

Emmet

Git Gutter:
https://github.com/jisaacks/GitGutter

Syntax Highlighting for Sass
(enable with: View -> Syntax -> Syntax Highlighting for Sass)

Sublime FTP
(create a connection by saving the file to: 

Zen Tabs

Subl
(make sure ~/bin has been created)
```
sudo ln -s "/opt/homebrew-cask/Caskroom/sublime-text/2.0.2/Sublime Text 2.app/Contents/SharedSupport/bin/subl" ~/bin/subl
```
This won't work until your add this to your .bash_profile file:
```
export PATH=$PATH:~/bin
```
And restart the terminal

GitHub
============
Add the [SSH key](https://github.com/settings/ssh)


AMPPS
===
- [Download](http://www.ampps.com/download)
- Turn on the Apache server and go to [http://localhost/ampps](http://localhost/ampps)
- Make a new domain (such as mysite.dev)
- Select that it is an addon domain, use the full filepath for the domain (/Users/me/Sites/mysite), under Advanced: add an entry to the host file
- Default DB user is 'root' with password: 'mysql'
