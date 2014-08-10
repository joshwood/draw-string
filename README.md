##Overview
Basically trying to simulate a web-meeting whiteboard while simultaneously ripping off the look at feel of a certain drawing tool found on many PCs.

The app is using [fabric.js](http://fabricjs.com/), [socket.io](http://socket.io/) on top of the [MEAN](http://www.mean.io/) stack

Open 2 browser windows to the same drawing URL to see socket.io in action. As you draw on one
screen it is reflect on the other. The "existing drawings" section will also auto update in all
connected browsers when a new drawing is created.

##Update
Moved original code into branch called basic-version-1.0.

##Setup
You will need ```node```, ```nodemon```, ```grunt``` and ```bower``` installed and a ```mongodb``` server up on local host (default port). ```nodemon``` is a nice to have but not required.

Go to [mongo.org](http://www.mongodb.org/) and get the latest mongodb. Install and start.

Go to [nodejs.org](http://nodejs.org/) and install node.

Note on proxy servers: If you are behind a firewall you will need the following config files in your home directory. Obviously replace host:port with your proxy info.

.npmrc

    proxy=http://host:port
    https-proxy=http://host:port

.bowerrc

    {
        "proxy":"http://host:port",
        "https-proxy":"http://host:port"
    }

Once you have done this you can use ```npm``` (node's package manager) to get the rest of the dependencies.

    npm install -g grunt-cli bower nodemon
    npm install

##Running in Development Mode
This will start a server running at ```localhost:9000```. The server will watch the 'public' directory for changes and push them to the browser automatically using the wonderful ```livereload```.
This will also launch the node server and setup a proxy to it so we can access our data while in development mode.

    grunt server

OR...

    grunt server-mon

The ```server-mon``` task does the same thing as ```server``` except it restarts the server automatically when a change occurs to its config files. This uses ```nodemon``` dependency.

##Build a distribution for Production
The following command will create a minified version of the app in the dist directory.

    grunt build

As expected, to run the application in ```node``` simply execute the commands below. This will start a server at ```yourhost:3030``` and open a web socket at ```yourhost:3000```
Obviously you would move this dist directory somewhere useful prior to executing.

    cd dist
    npm install --production
    node server

##Notes
* Since the ```grunt``` tasks also start the ```node``` server, you cannot start the ```node``` server independently while you are running in development node. This will cause port conflicts.

##Note to self
* git subtree push --prefix dist heroku master
