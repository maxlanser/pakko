// Gulp
const { series, parallel, src, dest, watch } = require("gulp");
const concat = require('gulp-concat');
const del = require("del");

// Pug and HTML plugins
const pug = require("gulp-pug");
const prettyHtml = require('gulp-pretty-html');

// SASS plugins
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
sass.compiler = require('node-sass');
const media_group = require('gulp-group-css-media-queries');
const purge = require('gulp-css-purge');

// JavaScript plugins
const uglify = require('gulp-uglify');

// Images plugins
const image = require('gulp-image');

// BrowserSync
const browserSync = require('browser-sync').create();

// Paths
const paths = {
  srcDir: "./src",
  devDir: "./dev",
  buildDir: "./public"
};


//Local BrowserSync server Tasks
function serveDev(done){
  browserSync.init({
      server: {
          baseDir: paths.devDir
      }
  });
  done();
}

function serveBuild(done){
  browserSync.init({
      server: {
          baseDir: paths.buildDir
      }
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

// clean "dev" folder
function cleanDev(cb) {
	return del(paths.devDir).then(() => {
		cb();
	});
}

// clean "build" folder
function cleanBuild(cb) {
	return del(paths.buildDir).then(() => {
		cb();
	});
}

// SASS Tasks
// compile SASS to CSS and paste into dev folder
function sassDev() {
  const vendorsCssList = [
      './node_modules/normalize.css/normalize.css',
      './node_modules/wow.js/css/libs/animate.css'
  ];

  return src(vendorsCssList)
      .pipe(sourcemaps.init())
      .pipe(src(paths.srcDir + '/scss/main.scss'))
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
          cascade: false
      }))
      .pipe(concat('style.css'))
      .pipe(media_group())
      .pipe(sourcemaps.write())
  .pipe(dest(paths.devDir  + '/css'))
  .pipe(browserSync.stream());
}

function cssBuild(){
return src( paths.devDir + '/css/*.css')
  .pipe(csso({
    restructure: false,
    sourceMap: false,
    debug: true
  }))
  .pipe(purge({
    trim : true,
    shorten : true,
    verbose : true
  }))
  .pipe(dest(paths.buildDir + '/css'));
}

// compile Pug files to HTML into "dev" folder
function htmlDev() {
	return src(paths.srcDir + '/pug/views/*.pug')
		.pipe(
			pug({
				basedir: "./pug/",
				doctype: "html"
			})
		)
		.pipe(prettyHtml({
			indent_size: 2,
			indent_char: ' ',
			unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
		}))
		.pipe(dest(paths.devDir));
}

function htmlBuild() {
	return src(paths.devDir + "/*.html")
		.pipe(dest(paths.buildDir));
}

function imagesDev(){
	return src(paths.srcDir + '/images/**/*.*')
		.pipe(dest(paths.devDir + '/images'));
}

function imagesBuild(){
	return src(paths.srcDir + '/images/**/*.*')
		.pipe(image({
				svgo: false
			}))
		.pipe(dest(paths.buildDir + '/images'));
}


function fontsDev(){
	return src(paths.srcDir + '/fonts/**/*.*')
		.pipe(dest(paths.devDir + '/fonts'));
}

function fontsBuild(){
	return src(paths.srcDir + '/fonts/**/*.*')
		.pipe(dest(paths.buildDir + '/fonts'));
}

function jsDev() {
	const jsPaths = [
		paths.srcDir + '/js/framework/**/*.js',
		paths.srcDir + '/js/libraries/**/*.js',
		paths.srcDir + '/js/plugins/**/*.js',
		paths.srcDir + '/js/*.js'
	];
	return src(jsPaths)
		.pipe(concat('main.js'))
		.pipe(dest( paths.devDir + '/js'));
}

function jsBuild() {
	return src(paths.devDir + '/js/*.js')
		.pipe(uglify())
		.pipe(dest( paths.buildDir + '/js'));
}

function watchDev(){
  watch(paths.srcDir + '/**/*.+(css|scss|sass)', {delay: 500}, sassDev);
  watch(paths.srcDir + '/pug/**/*.pug', {delay: 500}, series(htmlDev, reload));
  watch(paths.srcDir + '/images/**/*.*', {delay: 500}, series(imagesDev, reload));
  watch(paths.srcDir + '/js/**/*.js', {delay: 500}, series(jsDev, reload));
}


exports.default = series(
	cleanDev,
	parallel(jsDev, fontsDev, htmlDev, sassDev, imagesDev),
	serveDev,
	watchDev
);

exports.build = series(
	cleanBuild,
	parallel(htmlBuild, cssBuild, jsBuild, imagesBuild, fontsBuild)
);

exports.serveBuild = serveBuild;
