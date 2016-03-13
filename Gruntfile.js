module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
		, src: 'src'
		, dist: 'dist'


		, meta: {
			version: '<%= pkg.version %>'
			, banner: '/**\n * <%= pkg.name %> - v<%= meta.version %> \n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> Kiva Microfunds\n' +
				' * \n' +
				' * Licensed under the MIT license.\n' +
				' * <%= pkg.licenses[0].url %>\n' +
				' */\n'

		}


		, bump: {
			options: {
				files: ['package.json', 'bower.json']
				, updateConfigs: ['pkg']
				, commitMessage: 'Release v%VERSION%'
				, commitFiles: ['package.json', 'bower.json', 'dist']
				, createTag: true
				, tagName: 'v%VERSION%'
				, tagMessage: 'Version %VERSION%'
				, push: true
				, pushTo: 'origin'
				, gitDescribeOptions: '--long'
			}
		}


		, jshint: {
			options: {
				jshintrc: '.jshintrc'
			}
			, all: ['src/*.js', 'test/spec/**/*.js']
		}


		, rig: {
			compile: {
				options: {
					banner: '<%= meta.banner %>'
				}
				, files: {
					'<%= dist %>/iife/fbKiva.js': ['build/_iife.js']
					, '<%= dist %>/amd/fbKiva.js': ['build/_amd.js']
				}
			}
		}


		, shell: {
			'rm-dist': {
				options: {
					stderr: false
				},
				command: 'rm -rf dist/*'
			}
		}


		, uglify: {
			target: {
				options: {
					banner: '<%= meta.banner %>'
				}
				, files: {
					'<%= dist %>/iife/fbKiva.min.js': ['<%= dist %>/iife/fbKiva.js']
					, '<%= dist %>/amd/fbKiva.min.js': ['<%= dist %>/amd/fbKiva.js']
				}
			}
		}
	});


	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-rigger');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('release', function(target) {
		if (!target) {
			target = 'patch';
		}

		if (['patch', 'minor', 'major'].indexOf(target) > -1) {
			grunt.task.run([
				'bump-only:' + target
				, 'build'
				, 'bump-commit'
			]);
		}
	});

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('build', ['shell:rm-dist', 'rig', 'uglify']);
};