/**
 * borrowed from Y! Screen tests
 * git@git.corp.yahoo.com:Video/screen-web.git
 */

module.exports = function (grunt) {
    'use strict';
    var fs = require('fs'),
        child_process = require('child_process'),
        children = [], 
        stopGrunt = function (restart) {
            console.log('Grunt server stop!');
            children.forEach(function (P) {
                P.kill();
            });
            if (restart) {
                child_process.spawn('node_modules/.bin/grunt', [], {stdio: ['ignore', process.stdout, process.stderr], env: process.env});
            }
            process.exit();
        };
    grunt.config.init({
        express: {
          options: {
              },
          web: {
                options: {
                  script: 'app.js',
                }
            }
        },
        watch: {
          scripts: {
            files: '*.js',
            options: {
              livereload: true,
              port: 35729
            }
          }
        }
    });

    grunt.registerTask('default',['runServer','waitEvents', 'spawnwatch']);
    grunt.registerTask('runwatch', ['watch']);
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('spawnwatch', function() {
        children.push(grunt.util.spawn({
            cmd: 'node_modules/.bin/grunt',
            args: ['runwatch'],
            opts: {stdio: 'inherit'}
        }));
    });
    console.log('test111'); 
    grunt.registerTask('runServer', function() {
       children.push(grunt.util.spawn({
            cmd: 'node_modules/.bin/supervisor',
            args: ['-q', '-w', '.', 'app.js'],
            opts: {stdio: 'inherit', env: process.env}
        }));   
    });

    grunt.registerTask('waitEvents', function () {
        console.log('waitevent');
        this.async(); // This task never end
        fs.watch('._watch', function (event, file) {
            switch(file) {
            case 'stop':
                console.log('Grunt server stopped because you changed the file ._watch/stop ....');
                stopGrunt();
                break;
            case 'restart':
                console.log('Grunt server restarted because you changed the file ._watch/restart ....');
                stopGrunt(1);
                break;
            }
        });
    });
   process.stdin.pause(); 
};
