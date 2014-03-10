var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function(grunt) {
 
  grunt.initConfig({
    connect: {
      options: {
          port: 9000,
          hostname: 'localhost',
          base: 'app',
          livereload: true
      },
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
        files: 'app/**/*.*',
        options: {
          livereload: true
        }
      }
    },
 
    // grunt-open will open your browser at the project's URL
    open: {
      all: {
        // Gets the port from the connect configuration
        path: 'http://localhost:9000'
      }
    }

  });

  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-connect-proxy");
  grunt.loadNpmTasks("grunt-open");

  grunt.registerTask('server', function (target) {

    grunt.task.run([
      'configureProxies',
      'connect:livereload',
      'open',
      'watch'
    ]);

  });

};
