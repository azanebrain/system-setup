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
```

Link alfred:
$ brew cask alfred link

Open an app and move it to the "Applications" folder, and make sure it stops asking you about that

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

Sublime Text 2
============

Package Manager
https://sublime.wbond.net/installation

Emmet

Git Gutter:
https://github.com/jisaacks/GitGutter

Syntax Highlighting for Sass
(enable with: View -> Syntax -> Syntax Highlighting for Sass)

Sublime FTP
(create a connection by saving the file to: 

Zen Tabs

GitHub
============
Add the [SSH key](https://github.com/settings/ssh)
