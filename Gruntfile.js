var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        myApp:{
            web: 'public',
            server: 'app',
            dist: 'dist',
            dist_web: 'dist/public',
            dist_server: 'dist/app'
        },
        connect: {
            options: {
                port: 9000,
                hostname: 'localhost',
                base: ['public', 'vendor'],
                livereload: true
            },
            /*
             * we are proxying to our node server (that we start later in the file)
             * so we can get data and have our websockets
             */
            proxies: [
            {
                context: '/drawings',
                host: 'localhost',
                port: 3030,
                https: false,
                changeOrigin: false,
                xforward: false
            }
            ],
            livereload: {
                options: {
                    middleware: function (connect, options) {
                        var middlewares = [];
                        var directory = options.directory || options.base[options.base.length - 1];
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        options.base.forEach(function(base) {
                            // Serve static files.
                            middlewares.push(connect.static(base));
                        });

                        // Setup the proxy
                        middlewares.push(require('grunt-connect-proxy/lib/utils').proxyRequest);

                        // Make directory browse-able.
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                }
            }
        },
        watch: {
            all: {
                // Replace with whatever file you want to trigger the update from
                // Either as a String for a single entry
                // or an Array of String for multiple entries
                // You can use globing patterns like `css/**/*.css`
                // See https://github.com/gruntjs/grunt-contrib-watch#files
                files: 'public/**/*.*',
                options: {
                    livereload: true
                }
            }
        },

        // grunt-open will open your browser at the project's URL
        open: {
            all: {
                path: 'http://localhost:9000'
            }
        },
        /*
         * this is just great, we can fire up our node server for data and sockets
         * and we just proxy to it
         */
        shell: {
            node:{
                command: 'node server',
                options: {
                    async: true,
                    stdout: true,
                    stderr: true
                }
            },
            nodemon:{
                command: 'nodemon server.js',
                options: {
                    async: true,
                    stdout: true,
                    stderr: true
                }
            }
        },
        useminPrepare: {
            html: '<%= myApp.web%>/index.html',
            options: {
                dest: '<%= myApp.dist_web %>'
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            //html: ['<%= myApp.dist_web %>/{,*/}*.html'],
            html: '<%= myApp.dist_web%>/index.html',
            options: {
                assetsDirs: ['<%= myApp.dist_web %>']
            }
        },
        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= myApp.dist %>/*',
                        '!<%= myApp.dist %>/.git*'
                    ]
                }]
            }
        },
        copy: {
            dist: {
                files:[{
                    expand: true,
                    dot: true,
                    cwd: '<%= myApp.web %>',
                    dest: '<%= myApp.dist_web %>',
                    src:[
                        '*.html',
                        'images/**',
                        'styles/**',
                        'views/**/*.html'
                    ]
                },
                {
                    expand: true,
                    dot: true,
                    cwd: '<%= myApp.server %>',
                    dest: '<%= myApp.dist_server %>',
                    src:[
                        '**/*'
                    ]
                },
                {
                    expand: true,
                    dot: true,
                    cwd: '.',
                    dest: '<%= myApp.dist %>',
                    src:[
                        'server.js'
                    ]
                }
                ]
            }
        }
    });

    /**
     * starts a dev server at port 9000, with live-reload,
     * starts our node server at port 3030 (which also opens a websocket at port 3000),
     * establishes a proxy from our dev:9000 server to node:3030 so we can access all of our
     * data URLS and use sockets when in our development server using live-reload like a champ.
     */
    grunt.registerTask('server', function (target) {
        grunt.task.run([
            'shell:node',
            'configureProxies',
            'connect:livereload',
            //'open',  // you can uncomment this and the task will open your default browser to the URL - it's a little annoying sometimes
            'watch'
        ]);
    });

    /**
     * does everything 'server' does except it uses 'nodemon' to watch the node config files for changes
     * and reloading/restarting the node server if it sees changes. nodemon is a separate dependency you will need to install
     * it is not listed in package.json (npm install -g nodemon)
     */
    grunt.registerTask('server-mon', function (target) {
        grunt.task.run([
            'shell:nodemon',
            'configureProxies',
            'connect:livereload',
            //'open',
            'watch'
        ]);
    });

    /**
     * this task builds the distribution of the application.
     * Minifies/concats etc the JS files. this is not needed for dev purposes - see 'server' or 'server-mon'
     */
    grunt.registerTask('build', function (target) {
        grunt.task.run([
            'clean:dist',
            'useminPrepare',
            'concat',
            'copy:dist',
            //'cssmin',
            'uglify',
            'usemin'
        ]);
    });

};

/*
 * footnotes:
 * (there should be more)
 * Found grunt-shell here, lead me to grunt-shell-spawn which launches background shells
 * http://stackoverflow.com/questions/15230090/nodemon-like-task-in-grunt-execute-node-process-and-watch
 */

