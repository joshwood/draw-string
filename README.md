##Overview
Basically trying to simulate a web-meeting whiteboard while simultaneously ripping off the look at feel of a certain drawing tool found on many PCs.

The app is using [fabric.js](http://fabricjs.com/), [socket.io](http://socket.io/) on top of the [MEAN](http://www.mean.io/) stack

Open 2 browser windows to the same drawing URL to see socket.io in action. As you draw on one
screen it is reflect on the other. The "existing drawings" section will also auto update in all
connected browsers when a new drawing is created.

##Update
Moved original code into branch called basic-version-1.0.

##Setup
You will need ```node```, ```grunt``` and ```bower``` installed and a ```mongodb``` server up on local host (default port). Once you have your environment setup, get the project dependencies by executing.

    npm install 
    bower install

##Running in Development Mode
This will start a server running at ```localhost:9000```. The server will watch the 'public' directory for changes and push them to the browser automatically using the wonderful ```livereload```.
This will also launch the node server and setup a proxy to it so we can access our data while in development mode.

    grunt server

OR...

    grunt server-mon

The ```server-mon``` task does the same thing as ```server``` except it restarts the server automatically when a change occurs to its config files. Get ```nodemon``` by executing:

    npm install -g nodemon

##Running 'For Real' - Production
Create a distribution by executing the following. This creates a minified version of the app in the dist directory.

    grunt build


As expected, to run the application in ```node``` simply execute the commands below. This will start a server at ```yourhost:3030``` and open a web socket at ```yourhost:3000```
Obviously you would move this dist directory somewhere useful prior to executing.

    cd dist
    npm install --production
    node server

##Notes
* Since the ```grunt``` tasks also start the ```node``` server, you cannot start the ```node``` server independently while you are running in development node. This will cause port conflicts.
