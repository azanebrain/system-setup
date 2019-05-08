# SYSTEM SETUP

My computer setup, with a heavy dose of web dev tools and features.

I'm still working on this. Hopefully someday all these steps will be in one bash file that will setup everything in a few minutes without any human intervention

Maybe one day there'll be dot files...

NOTE: Watch out for `newmachinename`. This should be replaced with the name of the new machine.

Ubuntu (quick) Work in Progress:
```
mkdir ~/Sites
download chrome
 sudo apt-get install chromium-browser
sudo apt install git
sudo apt-get install xclip

sudo apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# Note: On Linux, after running the install script, if you get nvm: command not found or see no feedback from your terminal after you type:
command -v nvm

generate ssh key
install nvm
install firacode font
download vscode (can I install it with apt-get?)
source ~/.bashrc

# Other tools I always use
sudo apt install gitk
```

# IDE / Text Editor

## Visual Studio Code 

I started using VSCode for the Typescript support, but stayed for everything else.

* Download [VSCode](https://code.visualstudio.com/) - or the [Insiders Edition](https://code.visualstudio.com/insiders/)
* Install the Settings Sync Extension and configure it
* Install FiraCode font: `sudo apt install fonts-firacode`
* Restart VSCode

### Settings Sync

I use Settings Sync to store settings in GitHub (shan.code-settings-sync). Once you enter the Gist Key and ID, it will start to download everything. Then you'll probably need to restart VS Code

### FiraCode Font

[FiraCode](https://github.com/tonsky/FiraCode/wiki) is a monospaced ligature font that makes reading code easier. Never again be confused by "==" vs "==="!

# Setup folders

```
mkdir ~/Sites
```

# RSA Key

change `your_email@example.com` to whatever you use on services that require your SSH key.

cd mkdir -p ~/.ssh && ~/.ssh && ssh-keygen -t rsa -C "your_email@example.com" && ssh-add id_rsa

# Docker

The [official docs](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce-1) didn't work.
This stack overflow answer did: https://unix.stackexchange.com/a/363058

Setting up Docker Compose: https://docs.docker.com/compose/install/

# .NET Core

* Ubuntu 18.04: https://dotnet.microsoft.com/download/linux-package-manager/ubuntu18-04/sdk-current

# SSH Keys

Copy the public ssh key

```
pbcopy < ~/.ssh/id_rsa.pub
```

Add the SSH Key to all of your accounts:

- [BitBucket](https://bitbucket.org/account/user/azanebrain/ssh-keys/)
- [GitHub](https://github.com/settings/ssh)
- [GitLab](https://gitlab.com/profile/keys/new)
