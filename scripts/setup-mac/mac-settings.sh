# This configures system settings

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