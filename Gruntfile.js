module.exports = function(grunt) {
    /**
     * Loop through all of the dev dependencies found in
     * the package.json and loads them. Wammy!
     */
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        sass: {
            dev: {
                files: {
                    'stylesheets/screen.css': 'sass/screen.scss'
                }
            }
        },
        autoprefixer: {
            dev: {
                files: {
                    'stylesheets/screen.css': 'stylesheets/screen.css'
                }
            }
        },
        reactjsx: {
            all: {
                files: [{
                    expand: true,
                    src: [
                        '**/*.jsx'
                    ],
                    ext: '.js'
              }]
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', [
        'sass:dev',
        'autoprefixer:dev',
        'reactjsx:all'
    ]);
};
