"use strict"
const app = require('express')();
var mustache = require('mustache-express');
const serveur = require('http').createServer(app);
var io = require('socket.io')(serveur);

//todo mettre des messages dans la console pour les actions importante

var model = require('./model');

const cookieSession = require('cookie-session');
const session = cookieSession({
    secret: 'mot-de-passe-du-cookie',
    //maxAge : 1000 * 60 * 20  //milli, sec, minutes
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
    if(req.body.passUser !== req.body.passUserConf){
        res.redirect('/register');
    }
    var registered = model.register(req.body.nameUser, req.body.passUser);
    if (registered) {
        res.redirect('/modifications');
    }
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
    let univ = model.universityList();
    res.render('modification', {info: infoUser, infoUser : infoUser, univ : univ} );

});

//pour les admins pour les autres utilisateurs
app.get('/modifications/:id', is_authenticated, (req, res) => {
    if (res.locals.admin){
        let info = model.userInfo(req.params.id);
        let infoUser = model.userInfo(req.session.user);
        let univ = model.universityList();
        res.render('modification', {info: info, infoUser : infoUser, univ : univ} );
    }
    else
        res.redirect('/profil');
});

app.post('/modifications', is_authenticated, (req, res) => {
    var id = req.body.id;
    if(id === undefined){//savoir si les modifications on ete apporté par un admin ou
        id = req.session.user
    }
    model.modification(id, req.body.photo_de_profil, req.body.biographie, req.body.etudes, req.body.contact, req.body.univ);
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

var people={};

io.on('connection', (socket) => {
    //sauvegarder les id de se qui se connect
    let name = socket.request.session.user
    people[name] = socket.id;
    socket.emit()

    socket.on('chat message', (data) => {//ecoute du message

        let chatID = data.chatID;
        let otherID = model.otherID(chatID, name);

        //construction du message pour le sauvegarder
        let date1 = new Date();

        let dateLocale = date1.toLocaleString('fr-FR',{
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'});

        let saveMessage = dateLocale + " |> " + model.userInfo(name).nameUser + " : " + data.msg;

        model.addConversation(chatID, saveMessage);

        let newData = {msg: data.msg, info : model.userInfo(name)}

        //les deux emit servent pour savoir si on met le message d'un coté ou de l'autre
        io.to(people[name]).emit('chat message me', newData)
        io.to(people[otherID]).emit('chat message other', newData);//ici on renvoie le message a la page html, c'est ici qu'il faut gerer la fait que ce soit un utilisateur ou l'autre


    })
});

app.get('/chat/:id', is_authenticated, (req, res) => {//id est id1 + id2 doivent etre dans l'ordre croissant pour que la session soit unique
    //pour recuperer les id des 2 utilisateurs, regarder si celui de l'utilisateur courant est dedans puis en soustraire celui de l'autre utlisateur
    let chatID = req.params.id + "";
    let otherID = model.otherID(chatID, req.session.user);
    if(otherID === -1){
        res.status(404).send('vous n\'avez pas acces à ce chat, retour à votre    <a class="btn btn-primary" href="/profil" role="button">profil</a>');
    }

    //todo tester le fait qu'il faut etre amis pour pouvoir se parler
    let infoUser = model.userInfo(req.session.user);
    let infoFriends = model.allFriends(req.session.user);
    let infoOther = model.userInfo(otherID);
    let conv = model.getConversation(chatID);

    res.render('chat', {infoUser :infoUser, infoFriends : infoFriends, conv : conv, infoOther : infoOther, chatID : chatID});

});


app.get('/chatHub', is_authenticated, (req, res) => {

    let infoUser = model.userInfo(req.session.user);
    let infoFriends = model.allFriends(req.session.user);
    res.render('chathub', {infoUser :infoUser, infoFriends : infoFriends});
});