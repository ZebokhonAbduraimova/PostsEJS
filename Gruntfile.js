module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      js: {
        src: ["public/javascripts/*.js"],
        dest: "build/public/javascripts/scripts.js",
      },
      css: {
        src: ["public/css/*.css"],
        dest: "build/public/css/styles.css",
      },
    },
    uglify: {
      target: {
        files: {
          "build/public/javascripts/scripts.js": [
            "build/public/javascripts/scripts.js",
          ],
        },
      },
    },
    cssmin: {
      target: {
        files: [
          {
            expand: true,
            cwd: "build/public/css",
            src: ["*.css"],
            dest: "build/public/css",
            ext: ".css",
          },
        ],
      },
    },
    copy: {
      main: {
        files: [
          {
            cwd: "views/",
            src: "**/*",
            dest: "build/views",
            expand: true,
          },
          {
            cwd: "public/images",
            src: "**/*",
            dest: "build/public/images",
            expand: true,
          },
        ],
      },
    },
    imagemin: {
      dynamic: {
        files: [
          {
            expand: true,
            cwd: "build/public/images",
            src: ["*.{png,jpg,gif}"],
            dest: "build/public/images",
          },
        ],
      },
    },
    useref: {
      html: "build/views/layout.ejs",
      temp: "build/public",
    },
    clean: {
      build: {
        src: ["build/"],
      },
    },
  });

  grunt.loadNpmTasks("grunt-useref");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-imagemin");

  grunt.registerTask("default", [
    "clean",
    "copy",
    "imagemin",
    "concat",
    "uglify",
    "cssmin",
    "useref",
  ]);
};
