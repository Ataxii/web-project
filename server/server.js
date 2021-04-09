"use strict"
/* Serveur pour le site de recettes */
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();

const cookieSession = require('cookie-session');
app.use(cookieSession({
    secret: 'mot-de-passe-du-cookie',
    maxAge : 1000 * 60 * 20  //milli, sec, minutes
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

/**** ============  Routes pour l'utilisateur  ============ ****/

/** page d'acceuil **/
app.get('/', (req, res) => {
    res.render('main');
});

/** ======================== page d'inscription  ======================== **/

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


/**  ======================== page de connection ========================  **/

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    let login = model.login(req.body.nameUser, req.body.passUser); // login() return id
    if (login < 0) {
        var msg = "nom d'utilisateur ou mot de passe incerrect"
        res.render('login', {msg: msg});
    } else {
        req.session.user = login;
        res.redirect('/profil');
    }
});


/** ======================== déconnexion ======================== **/

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
});


/**======================== page de recherche d'autre utilisateur ========================**/

app.get('/research', is_authenticated, (req,res) => {
    let info = model.allUserInfo(req.session.user);
    res.render('research', {ressources : info});
})

app.post('/research', (req, res) => {
    res.redirect('/research');
});


/**======================== profil de l'utilisateur connecté ========================**/

app.get('/profil', is_authenticated, (req,res) => {
    let infoUser = model.userInfo(req.session.user);
    let infoFriends = model.allFriends(req.session.user);
    res.render('profil', {infoUser :infoUser, infoFriends : infoFriends});
})

app.post('/profil', (req, res) => {
    res.redirect('/profil');
});

/**======================== profil d'un utilisateur recherché ========================**/
app.get('/profilUser/:id', is_authenticated, (req,res) => {
    let info = model.userInfo(req.params.id);
    res.render('profilUser',  info);
})

app.get('/addfriends/:id', is_authenticated, (req, res) => {
    if(model.request(req.session.user, req.params.id)){
        res.redirect('/research');
    }//TODO faire la gestion de l'erreur
    else res.redirect('/research');

});

app.get('/delfriends/:id', is_authenticated, (req, res) => {
    model.delete(req.session.user, req.params.id)
    res.redirect('/profil');
    //TODO faire la gestion de l'erreur

});



function is_authenticated(req, res, next) {

    if (req.session.user !== undefined) {
        return next();
    }
    return res.status(401).send('Authentication required  <a class="btn btn-primary" href="/login" role="button">Connexion</a>');
}

app.listen(3000, () => console.log('listening on http://localhost:3000'));