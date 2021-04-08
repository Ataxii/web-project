"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');

let db = new Sqlite('../sqLite/main.db');

let idUser = 3;


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
    if(idlog === undefined){
        return -1;
    }

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
exports.allUserInfo = () => {
    //TODO mettre en paramettre l'id de l'utilisateru courant pour pas qu'il puisse s'ajouter en ami ( modifier la fonction)
    let array = [];
    var ids = db.prepare('SELECT id FROM userProfil').all();
    for(var element of ids){
        let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.id);
        let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.id);
        let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.id);
        let info = { id: element.id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie };
        array.push(info);
    }
    return array;
}
//
exports.userInfo = (id) => {
    let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(id);
    let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(id);
    let biographie = db.prepare('SELECT biographie FROM userProfil WHERE id = ?').get(id);
    let etudes = db.prepare('SELECT etudes FROM userProfil WHERE id = ?').get(id);
    let contact = db.prepare('SELECT contact FROM userProfil WHERE id = ?').get(id);
    let info = { id: id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil , biographie : biographie.biographie , etudes : etudes.etudes , contact : contact.contact };
    return info;
}

// fonction create/ set avec un id et tout les infos,
exports.modification = (id, photo, biographie, etudes, contact )=> {
    var insertLogin = db.prepare('UPDATE userProfil SET (@photo_de_profil, @biographie, @etudes, @contact) WHERE id = ?');
    var value = {photo_de_profil : photo, biographie: biographie, etudes : etudes, contact : contact};
    insertLogin.run(value, id);
}

/*** partie friends***/
//TODO faire les tests pour voir si ca marche
//concidere comme requete quand ils sont ami que dans un sens, concidere ami quand ils sont ami dans les 2 sens
exports.request = (id, idOtherUser )=> {
    //TODO corriger le probleme avec le is friends ou is request parce que pour l'instant si juste une personne ajoute l'autre, les 2 sont amis
    if (this.isRequest(id, idOtherUser)){
        return false;
    }
    var insertFriends = db.prepare('INSERT INTO userFriends VALUES (@id, @friends)');
    var value = {id : id, friends : idOtherUser};
    insertFriends.run(value);
    return true;
}

exports.isFriends = (id, idOtherUser )=> {
    let testId = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(idOtherUser, id);
    let testOtherId = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(id, idOtherUser);
    console.log(testId, testOtherId);
    return testId !== undefined && testOtherId !== undefined;
}

exports.isRequest = (id, idOtherUser )=> {
    let testOtherId = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(id, idOtherUser);
    return testOtherId !== undefined;
}

exports.allFriends = (id) => {
    let array = [];
    var ids = db.prepare('SELECT friends FROM userFriends where id = ?').all(id);
    console.log(ids);
    if(ids.size === 0){
        return array;
    }
    for(var element of ids){
        console.log(element.friends);
        let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.friends);
        let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.friends);
        let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.friends);
        let info = { id: element.friends, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie };
        array.push(info);
    }
    return array;
}

exports.delete = (id, idOtherUser )=> {
    db.prepare('DELETE FROM userFriends WHERE friends = ? and id = ?').run(idOtherUser, id);
}
