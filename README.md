##Overview
Simple project I ripped off from a firebase example I found on the web. I'm modifying it to use the MEAN stack (piece by piece).
I'm trying to simulate a goofy webmeeting whiteboard as an excuse to build something.
Eventually you will be able to create/save new drawings and view existing drawings.

##Setup
Run ```npm install``` to get the project dependencies.

Of course you will need a mongo server running on the default port.

##Running the application
Run ```node server``` to start the node server (runs on port 3030, socket listener is port 3000).

For development purposes you can execute ```grunt server``` which will launch a server on port 9000.
The server will watch the 'public' directory for changes and push them to the browser automatically.
This will also launch the node server and setup a proxy to it so we can access our data while in development mode.