const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const server = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const del = require('del');
const pug = require('gulp-pug');
const cached = require('gulp-cached');
const gcmq = require('gulp-group-css-media-queries');
const styleInject = require("gulp-style-inject");
const inlineCss = require('gulp-inline-css');

const pugToHtml = () => {
  return gulp.src('source/pug/pages/*.pug')
      .pipe(plumber())
      .pipe(pug({ pretty: true }))
      .pipe(cached('pug'))
      .pipe(gulp.dest('build'));
};

const styleInjectProcess = () => {
  return gulp.src("./build/*.html")
    .pipe(styleInject())
    .pipe(gulp.dest("./build"));
};

const css = () => {
  return gulp.src('source/sass/style.scss')
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(gcmq()) // выключите, если в проект импортятся шрифты через ссылку на внешний источник
      .pipe(gulp.dest('build/css'))
      .pipe(server.stream());
};

const inline = () => {
  return gulp.src('build/*.html')
    .pipe(inlineCss({
      applyStyleTags: true,
      applyLinkTags: false,
      removeStyleTags: false,
      removeLinkTags: false,
      applyWidthAttributes: true,
      applyTableAttributes: true
    }))
    .pipe(gulp.dest('build/'));
};

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}', {base: 'source'})
      .pipe(gulp.dest('build'));
};

const optimizeImages = () => {
  return gulp.src('build/img/**/*.{png,jpg}')
      .pipe(imagemin([
        imagemin.optipng({optimizationLevel: 3}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
      ]))
      .pipe(gulp.dest('build/img'));
};

const copy = () => {
  return gulp.src([
    'source/fonts/**',
    'source/img/**',
  ], {
    base: 'source',
  })
      .pipe(gulp.dest('build'));
};

const clean = () => {
  return del('build');
};

const syncServer = () => {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('source/pug/**/*.pug', gulp.series(pugToHtml, refresh));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series(css, pugToHtml, inline, refresh));
  gulp.watch('source/img/**/*.{png,jpg}', gulp.series(copyImages, pugToHtml, refresh));
};

const refresh = (done) => {
  server.reload();
  done();
};

const start = gulp.series(clean, copy, css, pugToHtml, inline, syncServer);

const build = gulp.series(clean, copy, css, pugToHtml, inline, optimizeImages);

exports.imagemin = optimizeImages;
exports.start = start;
exports.build = build;
