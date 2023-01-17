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
const inlineCss = require('gulp-inline-css');
const replace = require('gulp-replace');

const pugToHtml = () => {
  return gulp.src('source/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug({ pretty: true }))
    .pipe(cached('pug'))
    .pipe(gulp.dest('build'));
};

const replaceTag = () => {
  return gulp.src('build/*.html')
    .pipe(replace('styleforstyletag', 'style'))
    .pipe(gulp.dest('temp/'));
};

const cssForInline = () => {
  return gulp.src('source/sass/styleForInline.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(gcmq()) // выключите, если в проект импортятся шрифты через ссылку на внешний источник
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
};

const cssForStyleTag = () => {
  return gulp.src('source/sass/styleForStyleTag.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(gcmq()) // выключите, если в проект импортятся шрифты через ссылку на внешний источник
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
};

const inlineForInline = () => {
  return gulp.src('build/*.html')
    .pipe(inlineCss({
      extraCss: 'css/styleForInline.css',
      applyStyleTags: true,
      applyLinkTags: false,
      removeStyleTags: true,
      removeLinkTags: false,
      applyWidthAttributes: true,
      applyTableAttributes: true
    }))
    .pipe(gulp.dest('build/'));
};

const inlineForStyleTag = () => {
  return gulp.src('build/*.html')
    .pipe(inlineCss({
      extraCss: 'css/styleForStyleTag.css',
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

const copyHtml = () => {
  return gulp.src('temp/*.html')
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

  gulp.watch('source/pug/**/*.pug', gulp.series(cssForInline, cssForStyleTag, pugToHtml, inlineForInline, inlineForStyleTag, replaceTag, copyHtml, refresh));
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series(cssForInline, cssForStyleTag, pugToHtml, inlineForInline, inlineForStyleTag, replaceTag, copyHtml, refresh));
  gulp.watch('source/img/**/*.{png,jpg}', gulp.series(copyImages, pugToHtml, refresh));
};

const refresh = (done) => {
  server.reload();
  done();
};

const start = gulp.series(clean, copy, cssForInline, cssForStyleTag, pugToHtml, replaceTag, inlineForInline, copyHtml, syncServer);

const build = gulp.series(clean, copy, cssForInline, cssForStyleTag, pugToHtml, replaceTag, inlineForInline, copyHtml, optimizeImages);

exports.imagemin = optimizeImages;
exports.start = start;
exports.build = build;
