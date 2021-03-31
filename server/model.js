"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

let idUser = 0;


exports.register = (nameUser, passUser) => {
    if (this.isRegister(nameUser)) {
        return false;
    }

    let prepare = db.prepare('INSERT INTO userLogin VALUES (@id, @nameUser, @passUser)');
    prepare.run({ id: idUser, nameUser: nameUser, passUser: passUser });
    idUser++;
    return true;
}

exports.login = (nameUser, passUser) => {
    let idlog = db.prepare('SELECT id FROM userLogin WHERE nameUser = ? AND passUser = ?').get(nameUser, passUser);

    console.log(idlog.id);
    if (idlog.id !== undefined) {
        return idlog.id;
    } else return -1;
}

exports.isRegister = (nameUser) => {
    let pseudolog = db.prepare('SELECT id FROM userLogin WHERE nameUser = ?').get(nameUser);

    if (pseudolog.id !== undefined){
        return false;
    }
    else return true;
}


exports.lenghtPassword = ( passUser) => {
    if (passUser.length < 8){
        return -1;
    }
}
// fonction qui récup tout les utilisateurs (id, photo, pseudo) tableau de tableau+ recuperer les infos d'un utilisateur avec son id , + api centre d'interet (json -->parse --> require('fs')
exports.allUserinfo = () => {
    let arrayOfUserInfo = [];


}