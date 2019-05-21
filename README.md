# SYSTEM SETUP

My computer setup, with a heavy dose of web dev tools and features.

I'm still working on this. Hopefully someday all these steps will be in one bash file that will setup everything in a few minutes without any human intervention

Maybe one day there'll be dot files...

NOTE: Watch out for `newmachinename`. This should be replaced with the name of the new machine.

The following steps will take you through setting up my Ubuntu environment. It's opinionated so shake it up as needed :]

## Preparation

```
# Update everything because we'll need it
sudo apt-get update
```

## Setup VIM
```
sudo apt-get install vim
```

## Setup Git

```
# Install Git & tools I always use
# gitk is a really simple git history viewer
sudo apt install git gitk
```

## Generate SSH keys

```
# The best tutorial: https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# List the key so you can add it to GitHub / GitLab / etc
# You could try `pbcopy` so you don't display your code in the terminal, but you may not have it by default
cat ~/.ssh/id_rsa.pub
# pbcopy < ~/.ssh/id_rsa.pub
```

Now go add the key to your git profiles and hope it works. It takes ~5 minutes for the SSH key to get verified by GitHub before you can use it.

* [BitBucket](https://bitbucket.org/account/user/azanebrain/ssh-keys/)
* [GitHub](https://github.com/settings/ssh)
* [GitLab](https://gitlab.com/profile/keys/new)


## Pull This Project

```
# Clone it down into the development directory
mkdir ~/Sites
cd ~/Sites
git clone git@github.com:azanebrain/system-setup.git

# Symlink my gitconfig
ln -s ~/Sites/system-setup/git/.gitconfig ~/.gitconfig
```

## ZShell & [Oh My Zsh!](https://github.com/robbyrussell/oh-my-zsh)

I use ZShell because I like Zs! :zzz:

ZShell is pretty awesome because it uses `g` as an alias for `git` by default - just like me :]

Installation instructions: https://github.com/robbyrussell/oh-my-zsh/wiki/Installing-ZSH

```
sudo apt install zsh

# Setup Oh My Zsh to easily add plugins
sh -c "$(wget -O- https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

Now log out. Once you log in again, your development environment will be totally Z-ified.

## Theme

I like agnoster. Update `~/.zshrc` to use it:

```
ZSH_THEME="agnoster"
```

Hide the user and host from the command prompt

`vi ~/.oh-my-zsh/themes/agnoster.zsh-theme`

1. Update Main Prompt to exclude `prompt_context`
```
## Main prompt
build_prompt() {
  ...
  prompt_aws
  # prompt_context <-- This is the change!
  prompt_dir
  ...
}
```

## Zsh + Node Version Manager

We're going to use Node so set it up with the NVM plugin

```
# Setup NVM with ZSH (from https://github.com/lukechilds/zsh-nvm#as-an-oh-my-zsh-custom-plugin)
# Clone zsh-nvm into your custom plugins repo
git clone https://github.com/lukechilds/zsh-nvm ~/.oh-my-zsh/custom/plugins/zsh-nvm

# Then load as a plugin in your .zshrc as "zsh-nvm"
# After updating, it should look like this:
plugins=(
 git
 zsh-nvm
)
```

Now you'll definitely want to restart the terminal, but you also may need to restart the computer.

# Chrome

I had issues getting Chrome Stable setup, refer to the Snapcraft section.

```
# Chromium
# From: https://www.ubuntuupdates.org/ppa/google_chrome?dist=stable
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - 
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update 
sudo apt-get install chromium-browser
```

# Snapcraft

Snapcraft is a package manager for popular programs that don't target devs so they don't have easy desktop installation paths.

I'm not sure if it was Ubuntu 18 or Zsh, but I already had Snapcraft installed. :shrug:

This will install

* VSCode Insiders: I like to use the insiders version for cutting edge features
* [DBeaver Community Edition](https://dbeaver.io): Dabatabse client
* [Postman](https://getpostman.com): API testing / management
* Spotify: Music

```
snap install dbeaver-ce --edge && postman --classic && snap install spotify --classic
```

## Shortcut!

Instead of going through the manual steps for the extra tools, try setting everything up through Snap. Once each tool is installed you'll only have to go through the personal configuration steps to make your new machine feel like home.

* Docker: Container management. This seems to include Docker Compose as well 
* dotNET Core SDK: For developing .NET projects
* [Rider](https://www.jetbrains.com/rider): An IDE I use for .NETCore development

```
snap install dbeaver-ce --edge && postman --classic && snap install spotify --classic && snap install docker --classic && snap install dotnet-sdk --classic && snap install rider --classic
```

Now alias any programs that are using the snap namespace

```
sudo snap alias dotnet-sdk.dotnet dotnet
```

The following tools I had to install manually:

* DBeaver (wasn't showing up in the tools list)

# You're all set!

Now that the base requirements are setup, add your customizations. Things like scripts for work, projects you're actively developing, etc. For example, I have notes on how to setup Docker and .NET Core because I'm always going to be using them, and my customizations for VSCode.

Restart your computer and you're good to go!

---

The sections below highlight specific installation steps and tools. Now that you have the essentials setup, _go wild_.

# Docker

The [official docs](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce-1) didn't work.
This stack overflow answer did: https://unix.stackexchange.com/a/363058

# Docker Compose

Setting up Docker Compose: https://docs.docker.com/compose/install/

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
# Test that it worked:
docker-compose --version 
```

# .NET Core

* Ubuntu 18.04: https://dotnet.microsoft.com/download/linux-package-manager/ubuntu18-04/sdk-current

I'm still not 100% sure I understand the difference between installing the SDK vs the runtime, or when the SDK doesn't cover everything you'll need. If I run into a problem, I'll update these instructions.

# SSH Key Help

If you're having issues with the key, try some of the solutions in this section

NOTE: Change `your_email@example.com` to whatever you use on services that require your SSH key.

Create, generate, and add an SSH key to your profile

```
cd mkdir -p ~/.ssh && ~/.ssh && ssh-keygen -t rsa -C "your_email@example.com" && ssh-add id_rsa
```

# Visual Studio Code 

I started using VSCode for the Typescript support, but stayed for everything else.

## Download

* Download [VSCode](https://code.visualstudio.com/) - or the [Insiders Edition](https://code.visualstudio.com/insiders/)
* Install the Settings Sync Extension and configure it
* Install FiraCode font: `sudo apt install fonts-firacode`
* Restart VSCode

## Settings Sync

I use Settings Sync to store settings in GitHub (shan.code-settings-sync). Once you enter the Gist Key and ID, it will start to download everything. Then you'll probably need to restart VS Code

## FiraCode Font

[FiraCode](https://github.com/tonsky/FiraCode/wiki) is a monospaced ligature font that makes reading code easier. Never again be confused by "==" vs "==="!


# Troubleshooting

## apt-get is locked

`Could not get lock /var/lib/dpkg/lock-frontend - open (11: Resource temporarily unavailable)`

Since you're setting up a new machine, the "System Update" prompt might have triggered an OS update. If that's the case, apt-get is probably unavailable and other things are locked.

**Solution:** Wait for the update to finish

