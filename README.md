##Overview
Simple project I ripped off from a firebase example I found on the web. I'm modifying it to use the mean stack (piece by piece).
Eventually you will be able to create/save new drawings and view existing drawings.

##Setup
Run ```npm install``` to get the project dependencies.

##Running the application
Run ```node server``` to start the node server (runs on port 3030, socket listener is port 3000).

For development purposes you can execute ```grunt server``` which will launch a server on port 9000.
The server will watch the 'public' directory for changes and push them to the browser automatically.
You will still need the node server running for this setup, sorry.