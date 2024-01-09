const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash'); 
const passport = require('passport')

//Inicializaciones
const app = express();
require('./database'); 
require('./config/passport')

//Configuraciones
app.set('puerto', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout:'main',
    defaultDir: path.join('views', 'layouts'),
    partialsDir: path.join(__dirname,'views', 'partials'),
    extname: 'hbs',
    runtimeOptions: {
        allowProtoMethodsByDefault:true,
        allowProtoPropertiesByDefault:true
    }   
}));
app.set('view engine','hbs');

//Middleware
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method')); //delete, put, get
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Variables Globales
app.use( (req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.usuario = req.user || null;
    
    next();
})
//Rutas
app.use(require('./routes/index'));
app.use(require('./routes/notes'));
app.use(require('./routes/users'));

//Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

//Servidor
app.listen(app.get('puerto'), ()=>{
    let puerto = app.get('puerto');
    console.log('Servidor corriendo en el puerto ' + puerto);
})
