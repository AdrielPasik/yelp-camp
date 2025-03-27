if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require("express");

// Importa el módulo 'path' de Node.js.
const path = require("path");

// Importamos el módulo mongoose para interactuar con MongoDB
const mongoose = require("mongoose");

// Importamos el modulo ejs-mate
const ejsMate = require("ejs-mate");

// Importamos los esquemas de validación
const { campgroundSchema, reviewSchema } = require("./schemas.js");

const ExpressError = require('./utils/ExpressError');


// Importamos method override que previamente fue instalado en el directorio en la terminal (npm i method-override)
const methodOverride = require("method-override");

const session = require('express-session')
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
// Importamos el modelo
const Campground = require("./models/campground");

const Review = require('./models/review');

const campgroundsRoutes = require('./routes/campgrounds.js');
const reviewsRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');
const helmet = require('helmet');

// Definimos una función asincrónica llamada "main" que se encargará de realizar la conexión a la base de datos
async function main() {
    try {
        // Usamos el método "connect" de mongoose para conectarnos a la base de datos
        await mongoose.connect(dbUrl, {
            // Opciones de conexSión
            useNewUrlParser: true,        // Utilizar el nuevo motor de análisis de URL (parser)
            useUnifiedTopology: true,      // Utilizar un motor de topología unificada (nueva configuración de red)
           
        });

        // Imprimimos un mensaje en la consola si la conexión es exitosa
        console.log("Conexión a la base de datos establecida con éxito");
    } catch (err) {
        // Capturamos cualquier error que pueda ocurrir durante la conexión y lo imprimimos en la consola
        console.log("Error al conectar a la base de datos:", err);
    }
}

// Llamamos a la función "main" y manejamos cualquier error que pueda ocurrir durante su ejecución
main().catch(err => console.log(err));

const app = express();

// Configura el motor de plantillas EJS para ser utilizado por Express, utilizando las características y mejoras proporcionadas por el módulo ejsMate.
app.engine("ejs", ejsMate);

// Configura la aplicación para usar el motor de plantillas EJS.
app.set("view engine", "ejs");

// Establece la ruta del directorio de vistas.
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const User = require('./models/user.js')
const mongoSanitize = require('express-mongo-sanitize');

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(mongoSanitize({
    replaceWith: '_'
}))

app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
   
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    // 
    "https://api.maptiler.com/", 
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxkmnc3cq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/campgrounds',campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)
app.use('/', userRoutes)


app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})