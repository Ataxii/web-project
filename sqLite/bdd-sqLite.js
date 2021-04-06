var sqlite = require('better-sqlite3');
var db = new sqlite('./main.db');

db.prepare('DROP TABLE IF EXISTS userLogin').run();
db.prepare('DROP TABLE IF EXISTS userProfil').run();

db.prepare('CREATE TABLE userLogin (id INTEGER PRIMARY KEY, nameUser TEXT, passUser TEXT)').run();
db.prepare('CREATE TABLE userProfil (id INTEGER PRIMARY KEY, photo_de_profil TEXT, biographie TEXT, etudes TEXT, contact TEXT)').run();

var insertLogin = db.prepare('INSERT INTO userProfil VALUES (@id, @photo_de_profil, @biographie, @etudes, @contact)');
var insertProfil = db.prepare('INSERT INTO userLogin VALUES (@id, @nameUser, @passUser)');
var value = {id : 1, photo_de_profil : "https://www.jeancoutu.com/globalassets/revamp/photo/conseils-photo/20160302-01-reseaux-sociaux-profil/photo-profil_301783868.jpg", biographie: "bastien, 32 ans, etudiants chercheur", etudes : "portail descrates", contact : "email : fakeMail@gmail.com"};
var value1 = {id : 1, nameUser : "jean", passUser : "123456789"};

insertLogin.run(value);
insertProfil.run(value1);

