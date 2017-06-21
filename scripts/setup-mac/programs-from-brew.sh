# This script installs programs for a Mac environment using Brew
# NOTE: I do NOT suggest actually running this from the terminal. It may break, and you may end up with a bunch of programs you don't actually want'

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