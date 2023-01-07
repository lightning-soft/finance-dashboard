# Clone the Project

# GitHub / GitLab Users
$ git clone https://gitlab.com/ams-trading-group-platform/client.git

# Switch location to the cloned directory
$ cd client

# Install dependencies
$ npm install

# Run your app
$ npm start # or ng serve # or npm run start

# Build your app (production build)
$ ng build --prod

# Local Build
$ ng build

# Package your app (**for windows**)
$ npm run electron:win
# The above will create "dest" folder inside the root of your app.
# You can find your relatvant build inside of this folder. dest > tradrr-win32-ia32

# Package your app (**for macOS**)
$ npm run package-mac
# The above will create "dest" folder inside the root of your app.
# You can find your relatvant build inside of this folder. dest > tradrr-darwin-x64

# Package your app (**for Linux**)
$ npm run package-linux
# The above will create "dest" folder inside the root of your app.
# You can find your relatvant build inside of this folder. dest > tradrr-linux-x64


