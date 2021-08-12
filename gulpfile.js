// Пути
let project_folder = 'dist',
    source_folder = 'app',
    fs = require('fs');

let path = {
    build: {
        html: project_folder + '/',
        parts: project_folder + '/html/',
        css: project_folder + '/css/',
        libs: project_folder + '/libs/',
        js: project_folder + '/js/',
        json: project_folder + '/json/',
        img: project_folder + '/images/',
        fonts: project_folder + '/fonts/'
    },
    src: {
        html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        parts: source_folder + '/templates/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        libs: source_folder + '/libs/**/*.css',
        js: source_folder + '/js/**/*.js',
        json: source_folder + '/json/*.json',
        img: source_folder + '/images/**/*.{png,jpg,gif,ico,svg,webp}',
        fonts: source_folder + '/fonts/*.ttf'
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/images/**/*.{png,jpg,gif,ico,svg,webp}'
    },
    clean: [project_folder + '/css/', project_folder + '/html/', project_folder + '/js/', project_folder + '/images/', project_folder + '/maps/']
};

// Окружение
let { src, dest } = require('gulp'),
    gulp          = require('gulp'),
    browsersync   = require('browser-sync').create(),
    fileinclude   = require('gulp-file-include'),
    del           = require('del'),
    scss          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    gcmq          = require('gulp-group-css-media-queries'),
    clean_css     = require('gulp-clean-css'),
    rename        = require('gulp-rename'),
    uglify        = require('gulp-uglify-es').default,
    imagemin      = require('gulp-imagemin'),
    webp          = require('gulp-webp'),
    webphtml      = require('gulp-webp-html'),
    webpcss       = require('gulp-webpcss'),
    svgSprite     = require('gulp-svg-sprite'),
    ttf2woff      = require('gulp-ttf2woff'),
    ttf2woff2     = require('gulp-ttf2woff2'),
    fonter        = require('gulp-fonter'),
    sourcemaps    = require('gulp-sourcemaps'),
    notify        = require('gulp-notify');

let bootsrapFiles = "node_modules/bootstrap/dist/js/bootstrap.bundle.js";

// Создаем окружение
function browserSync() {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/'
        },
        port: 3000,
        open: true,
        notify: false
    });
}

// Перезагружаем браузер
function reload(done) {
    browsersync.reload();
    done();
}

// Чистим левые файлы
function clean() {
    return del(path.clean)
}

// Собираем HTML файлы
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

// Собираем CSS файлы
function css() {
    return src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(
            scss({ outputStyle: 'expanded' }).on("error", notify.onError())
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        /*.pipe(
            webpcss({
                webpClass: '.webp',
                noWebpClass: '.no-webp'
            })
        )*/
        .pipe(sourcemaps.write('../maps'))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

// Прод версия
function cssprod() {
    return src(path.src.css)
        .pipe(
            scss({ outputStyle: 'compressed' }).on("error", notify.onError())
        )
        .pipe(
            gcmq()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        .pipe(
            webpcss({
                webpClass: '.webp',
                noWebpClass: '.no-webp'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: '.min.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

// Собираем JS файлы
function js() {
    return src([path.src.js, bootsrapFiles])
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

// Собираем изображения
function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 // 0-7
            })
        )

        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())

    cb()
}

// Конвертация в ttf
gulp.task('otf2ttf', function () {
    return gulp.src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/'));
});

// Конвертаия c ttf в woff и woff2
gulp.task('fonts', function () {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
});

// Спрайты для SVG
gulp.task('svgSprite', function () {
   return gulp.src([source_folder + '/images/icons/*.svg'])
       .pipe(svgSprite({
           mode: {
               stack: {
                   sprite: '../sprite.svg',
                   example: true
               }
           }
       }))
       .pipe(dest(source_folder + '/images/icons/'))
});

gulp.task('fontsStyle', function () {
    let file_content = fs.readFileSync(source_folder + '/scss/_fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
});

// Перенос libs - подключаемых библиотек
gulp.task('libs', function () {
   return src(path.src.libs)
       .pipe(dest(path.build.libs))
});

// Перенос json - для gulp-file-include
gulp.task('json', function () {
    return src(path.src.json)
        .pipe(dest(path.build.json))
});

// Перенос html - включаемых элементов
gulp.task('parts', function () {
    return src(path.src.parts)
        .pipe(dest(path.build.parts))
});

function cb() {

}

// Отслеживаем изменения
function watchFiles() {
    gulp.watch([path.watch.img], gulp.series(images, reload));
    gulp.watch([path.watch.html], gulp.series(html, reload));
    gulp.watch([path.watch.css], gulp.series(css, reload));
    gulp.watch([path.watch.js], gulp.series(js, reload));
}

//
let build = gulp.series(clean, gulp.parallel(css, html, js, images));
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.reload  = reload;
exports.js      = js;
exports.css     = css;
exports.cssprod = cssprod;
exports.html    = html;
exports.images  = images;
exports.build   = build;
exports.watch   = watch;
exports.default = watch;
