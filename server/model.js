"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

let idUser = 0;


exports.register = (nameUser, passUser) => {
    if (this.login(nameUser, passUser) == -1) {
        return false;
    }
    let prepare = db.prepare('INSERT INTO user VALUES (@id, @nameUser, @passUser)');
    prepare.run({ id: idUser, nameUser: nameUser, passUser: passUser });
    idUser++;
    return true;
}

exports.login = (nameUser, passUser) => {
    let idlog = db.prepare('SELECT id FROM userLogin WHERE name = ? AND password = ?').get(nameUser, passUser);

    console.log(idlog.id);
    if (idlog.id !== undefined) {
        return idlog.id;
    } else return -1;
}

exports.register = (nameUser) => {
    let pseudolog = db.prepare('SELECT nameUser FROM userLogin WHERE name = ?').get(nameUser);

    if (pseudolog.nameUser !== undefined){
        return pseudolog.nameUser;
    }
    else return -1;
}


exports.lenghtPassword = ( passUser) => {
    if (passUser.length < 8){
        return -1;
    }
}
// fonction qui récup tout les utilisateurs (id, photo, pseudo) tableau de tableau+ recuperer les infos d'un utilisateur avec son id , + api centre d'interet (json -->parse --> require('fs')
() => {

}