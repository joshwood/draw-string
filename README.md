##Overview
I'm modifying a simple [firebase drawing app](http://runnable.com/UnA1wDlk6cVmAAAr/firebase-collaborative-drawing-example-for-javascript)
I found on [runnable](http://runnable.com/) to use the [MEAN](http://www.mean.io/) stack and [socket.io](http://socket.io/) while adding a few bells and whistles.
Basically trying to simulate a web-meeting whiteboard.
Eventually you will be able to create/save named drawings, view existing drawings, leave comments on a drawing,
and hopefully login using various mechanisms.

Open 2 browser windows to the same drawing URL to see socket.io in action. As you draw on one
screen it is reflect on the other. The "existing drawings" section will also auto update in all
connected browsers when a new drawing is created.

Checkout "re-draw", it works well in chrome not so much in IE.

##Setup
You will need ```node``` and ```grunt``` installed and a ```mongodb``` server up on local host (default port). Once you have your environment setup, get the project dependencies by executing.

    npm install 

##Running in Development Mode
This will start a server running at ```localhost:9000```. The server will watch the 'public' directory for changes and push them to the browser automatically using the wonderful ```livereload```.
This will also launch the node server and setup a proxy to it so we can access our data while in development mode.

    grunt server

OR...

    grunt server-mon

The ```server-mon``` task does the same thing as ```server``` except it restarts the server automatically when a change occurs to its config files. Get ```nodemon``` by executing:

    npm install -g nodemon

##Running 'For Real' - Production
As expected, to run the application in ```node``` simply execute the command below. This will start a server at ```localhost:3030``` and open a web socket at ```localhost:3000```

    node server

##Notes
* Since the ```grunt``` tasks also start the ```node``` server, you cannot start the ```node``` server independently while you are running in development node. This will cause port conflicts.
