"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('main.db');

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

    if (idlog.id !== undefined) {
        return idlog.id;
    } else return -1;
}

exports.isRegister = (nameUser) => {
    let pseudolog = db.prepare('SELECT id FROM userLogin WHERE nameUser = ?').get(nameUser);
    return pseudolog !== undefined;

}


exports.lenghtPassword = ( passUser) => {
    if (passUser.length < 8){
        return -1;
    }
}
// fonction qui récup tout les utilisateurs (id, photo, pseudo) tableau de tableau+ recuperer les infos d'un utilisateur avec son id , + api centre d'interet (json -->parse --> require('fs')
exports.allUserinfo = () => {
    let array = [];
    let ids = db.prepare('SELECT id FROM userLogin');
    for(let id in ids){
        let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(id);
        let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(id);
        let info = { id: id, nameUser: pseudo , photo_de_profil : photo };
        array.push(info);
    }
    return array;
}
//
exports.userInfo = (id) => {
    let array = [];
    let ids = db.prepare('SELECT id = ? FROM userLogin').get(id);
    for(id in ids){
        let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(id);
        let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(id);
        let biographie = db.prepare('SELECT biographie FROM userProfil WHERE id = ?').get(id);
        let etudes = db.prepare('SELECT etudes FROM userProfil WHERE id = ?').get(id);
        let contact = db.prepare('SELECT contact FROM userProfil WHERE id = ?').get(id);
        let info = { id: id, nameUser: pseudo , photo_de_profil : photo , biographie : biographie , etudes : etudes , contact : contact };
        array.push(info);
    }
    return array;
}

// fonction create/ set avec un id et tout les infos