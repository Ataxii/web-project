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
    let idlog = db.prepare('SELECT id FROM user WHERE name = ? AND password = ?').get(nameUser, passUser);

    console.log(idlog.id);
    if (idlog.id != undefined) {
        return idlog.id;
    } else return -1;
}