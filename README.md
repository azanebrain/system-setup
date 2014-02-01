system-setup
============

My web dev setup

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
$ brew tap phinze/homebrew-cask
Now install all your programs.
If you need to search for your apps use:

$ brew cask search <your-app>

```
brew install brew-cask
brew install tree
brew cask install alfred
brew cask install dropbox
brew cask install firefox
brew cask install google-chrome
brew cask install google-drive
brew cask install heroku-toolbelt
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
- Subl
- - (make sure ~/bin has been created)
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
