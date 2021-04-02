"use strict"
/* Serveur pour le site de recettes */
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();

const cookieSession = require('cookie-session');
app.use(cookieSession({
    secret: 'mot-de-passe-du-cookie',
}));

// parse form arguments in POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', '../views');

app.use(authenticated);

function authenticated(req, res, next) {
    if (req.session.user !== undefined) {
        res.locals.authenticated = true;
    }
    next();
}

/**** Routes pour l'utilisateur ****/

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', (req, res) => {
    //faire un message en rouge avec l'erreur acssocié plustard
    if(req.body.passUser != req.body.passUserConf){
        res.redirect('/register');
    }
    var registerable = model.register(req.body.nameUser, req.body.passUser);
    if (registerable) {
        res.redirect('/');
    }
    res.redirect('/register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    if (req.session.user !== undefined) {
        res.redirect('/profil');
    }
    let login = model.login(req.body.nameUser, req.body.passUser);
    if (login < 0) { res.redirect('/login'); } else {
        req.session.user = login;
        res.redirect('/profil');
    }
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});

function is_authenticated(req, res, next) {

    if (req.session.user !== undefined) {
        return next();
    }
    res.status(401).send('Authentication required');
}

app.listen(3000, () => console.log('listening on http://localhost:3000'));