##Overview
I'm modifying a simple [firebase drawing app](http://runnable.com/UnA1wDlk6cVmAAAr/firebase-collaborative-drawing-example-for-javascript)
I found on runnable, to use the MEAN stack and socket.io.
Basically trying to simulate a web-meeting whiteboard, adding a few bells and whistles.
Eventually you will be able to create/save named drawings, view existing drawings, leave comments on a drawing,
and hopefully login using various mechanisms.

##Setup
You will need node and grunt installed and a mongodb server up on local host (default port).

Run ```npm install``` to get the project dependencies.

##Running the application
For development purposes you can execute ```grunt server``` which will launch a server on port 9000.
The server will watch the 'public' directory for changes and push them to the browser automatically.
This will also launch the node server and setup a proxy to it so we can access our data while in development mode.

OR...

For development purpose, if you have nodemon installed you can execute ```grunt server-mon```.
This task does the same thing as ```grunt server``` except it uses nodemon to monitor node server
changes and restarts the server automatically when a change occurs.

     npm install -g nodemon

OR..

For non-development purposes, run ```node server``` to start the node server (runs on port 3030, socket listener is port 3000).

BUT...

Do only run ONE of these on the same host or you will get port conflicts