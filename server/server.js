"use strict"
const app = require('express')();
var mustache = require('mustache-express');
const serveur = require('http').createServer(app);
var io = require('socket.io')(serveur);


var model = require('./model');

const cookieSession = require('cookie-session');
const session = cookieSession({
    secret: 'mot-de-passe-du-cookie',
    maxAge : 1000 * 60 * 20  //milli, sec, minutes
    //todo faire en sorte que le cookie disparaisse quand on ferme toutes les pages
})
app.use(session);

io.use((socket, next) => {session(socket.request, {}, next)});//transfert de cookie session à socket.io

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', '../views');

app.use(authenticated);
app.use(admin);

function admin(req, res, next) {
    if (req.session.user < 0){
        res.locals.admin = true;
    }
    next();
}

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
    if (login === 0) {
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
    let infoUser = model.userInfo(req.session.user);
    let info = model.allUserInfo(req.session.user);
    res.render('research', {ressources : info, infoUser :infoUser });
})

app.post('/research', (req, res) => {
    res.redirect('/research/'+ req.body.searchs);
});



app.get('/research/:search', is_authenticated, (req,res) => {
    let infoUser = model.userInfo(req.session.user);
    let info = model.allUserInfoWithResearch(req.session.user, req.params.search);
    res.render('research', {ressources : info, infoUser :infoUser });
})



/**======================== profil de l'utilisateur connecté ========================**/

app.get('/profil', is_authenticated, (req,res) => {
    let infoUser = model.userInfo(req.session.user);
    let infoFriends = model.allFriends(req.session.user);
    let infoRequest = model.allRequestIn(req.session.user);
    res.render('profil', {infoUser :infoUser, infoFriends : infoFriends, infoRequest: infoRequest});
})

app.post('/profil', (req, res) => {
    res.redirect('/profil');
});

/**======================== profil d'un utilisateur recherché ========================**/
app.get('/profilUser/:id', is_authenticated, (req,res) => {
    let infoUser = model.userInfo(req.session.user);
    let info = model.userInfo(req.params.id);
    res.render('profilUser',  {info: info, infoUser : infoUser});
})

app.get('/addfriends/:id', is_authenticated, (req, res) => {
    if(model.request(req.session.user, req.params.id)){
        res.redirect('/profil');
    }//TODO faire la gestion de l'erreur
    else res.redirect('/profil');

});

app.get('/delfriends/:id', is_authenticated, (req, res) => {
    model.delete(req.session.user, req.params.id)
    res.redirect('/profil');
    //TODO faire la gestion de l'erreur

});

/**======================== modification d'un profil ========================**/

//pour l'utilisateur connecté
app.get('/modifications', is_authenticated, (req, res) => {
    let infoUser = model.userInfo(req.session.user);
    res.render('modification', {info: infoUser, infoUser : infoUser} );

});

//pour les admins pour les autres utilisateurs
app.get('/modifications/:id', is_authenticated, (req, res) => {
    if (res.locals.admin){
        let info = model.userInfo(req.params.id);
        let infoUser = model.userInfo(req.session.user);
        res.render('modification', {info: info, infoUser : infoUser} );
    }
    else
        res.redirect('/profil');
});

app.post('/modifications', (req, res) => {
    var allInfo = {id : req.body.id, photo_de_profil : req.body.photo_de_profil, biographie: req.body.biographie, etudes : req.body.etudes, contact : req.body.contact}
    var id = req.body.id;
    console.log(id)
    if(req.body.id === undefined){
        id = req.session.user
    }
    model.modification(id, req.body.photo_de_profil, req.body.biographie, req.body.etudes, req.body.contact);
    res.redirect('/profil');
});


function is_authenticated(req, res, next) {

    if (req.session.user !== undefined) {
        return next();
    }
    return res.status(401).send('Authentication required  <a class="btn btn-primary" href="/login" role="button">Connexion</a>');
}



serveur.listen(3000, () => console.log('listening on http://localhost:3000'))



//PARTIE DE CHAT



io.on('connection', (socket) => {
    //sauvegarder les id de se qui se connect
    console.log("utilisateur connecté : " + socket.request.session.user);

    socket.on('chat message', (msg) => {//ecoute du message 
        console.log(msg);
        io.emit('chat message', msg);//ici on renvoie le message a la page html, c'est ici qu'il faut gerer la fait que ce soit un utilisateur ou l'autre
    })
});

app.get('/chat/:id1/:id2', (req, res) => {//id1 et id2 doivent etre dans l'ordre croissant pour que la session soit unique
    var conv = model.getConversation(req.params.id1, req.params.id2);
    //faire une popup à l'utilisateur courant quand l'autre est connecté
    //faire le emit avec io
    if (req.session.user === req.params.id1 ||req.session.user === req.params.id2 ){
        res.render('chat', req.session.id);
    }
    else{
        res.redirect('/profil');
    }
});


app.get('/chat', (req, res) => {
    res.render('chat', req.session.id);
});