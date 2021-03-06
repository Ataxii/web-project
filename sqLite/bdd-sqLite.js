var sqlite = require('better-sqlite3');
var db = new sqlite('main.db');

db.prepare('DROP TABLE IF EXISTS userLogin').run();
db.prepare('DROP TABLE IF EXISTS userProfil').run();
db.prepare('DROP TABLE IF EXISTS userFriends').run();
db.prepare('DROP TABLE IF EXISTS chat').run();
db.prepare('DROP TABLE IF EXISTS saveid').run();

db.prepare('CREATE TABLE userLogin (id INTEGER PRIMARY KEY, nameUser TEXT, passUser TEXT)').run();
db.prepare('CREATE TABLE userProfil (id INTEGER PRIMARY KEY, photo_de_profil TEXT, biographie TEXT, etudes TEXT, contact TEXT, university TEXT)').run();
db.prepare('CREATE TABLE userFriends (id INTEGER, friends INTEGER)').run();
db.prepare('CREATE TABLE chat (idchat INTEGER, message TEXT)').run(); //pour l'id du chat c'est la concatenation des 2 id utilisateurs par ordre croissant, il y a dans le message toutes les données necessaire pour l'affichage
db.prepare('CREATE TABLE saveid (id INTEGER)').run();

var insertLogin = db.prepare('INSERT INTO userProfil VALUES (@id, @photo_de_profil, @biographie, @etudes, @contact, @university)');
var insertProfil = db.prepare('INSERT INTO userLogin VALUES (@id, @nameUser, @passUser)');


db.prepare('INSERT INTO saveid VALUES (@id)').run({id : 3});

//création de quelques utilisateurs pour pas que le site soit completement vide quand on recharge la base de donnée
var value = {id : 1, photo_de_profil : "https://www.jeancoutu.com/globalassets/revamp/photo/conseils-photo/20160302-01-reseaux-sociaux-profil/photo-profil_301783868.jpg", biographie: "bastien, 32 ans, etudiant chercheur", etudes : "portail descrates", contact : "email : fakeMail@gmail.com", university :"aix-marseille"};
var value1 = {id : 1, nameUser : "jean", passUser : "123456789"};
var value2 = {id : 2, photo_de_profil : "https://www.jeancoutu.com/globalassets/revamp/photo/conseils-photo/20160302-01-reseaux-sociaux-profil/photo-profil_301783868.jpg", biographie: "Lucie, 22 ans, etudiante L2 paster, je suis là pour le fun", etudes : "portail paster", contact : "email : fakeMailDeLucie@gmail.com", university :"aix-marseille"};
var value3 = {id : 2, nameUser : "lucie", passUser : "123456789"};
var value4 = {id : -4, photo_de_profil : "https://www.ulyces.co/wp-content/uploads/2021/02/9267284e7733f4bec00d2e114d3f3ba1_XL.jpg", biographie: "je suis l'admin", etudes : "root me", contact : "email : fakeMailAdmin@gmail.com", university :"aix-marseille"};
var value5 = {id : -4, nameUser : "admin1", passUser : "123456789"};



insertLogin.run(value);
insertProfil.run(value1);
insertLogin.run(value2);
insertProfil.run(value3);
insertLogin.run(value4);
insertProfil.run(value5);


