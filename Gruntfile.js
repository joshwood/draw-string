var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function(grunt) {

    grunt.initConfig({
        connect: {
            options: {
                port: 9000,
                hostname: 'localhost',
                base: 'public',
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
        }

    });

    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-connect-proxy");
    grunt.loadNpmTasks("grunt-open");
    grunt.loadNpmTasks("grunt-shell-spawn");

    grunt.registerTask('server', function (target) {
        grunt.task.run([
            'shell:node',
            'configureProxies',
            'connect:livereload',
            //'open',
            'watch'
        ]);
    });

    grunt.registerTask('server-mon', function (target) {
        grunt.task.run([
            'shell:nodemon',
            'configureProxies',
            'connect:livereload',
            //'open',
            'watch'
        ]);
    });

};

/*
 * footnotes:
 * (there should be more)
 * Found grunt-shell here, lead me to grunt-shell-spawn which launches background shells
 * http://stackoverflow.com/questions/15230090/nodemon-like-task-in-grunt-execute-node-process-and-watch
 */

