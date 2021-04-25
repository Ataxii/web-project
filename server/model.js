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
        return 0;
    }

    if (idlog.id !== undefined) {
        return idlog.id;
    } else return 0;
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
exports.allUserInfo = (id) => {

    let array = [];
    var ids = db.prepare('SELECT id FROM userProfil').all();
    for(var element of ids){
        if(id !== element.id && !this.isRequest(element.id, id)&& !this.isRequest(id, element.id) && !this.isFriends(id, element.id)){
            let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.id);
            let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.id);
            let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.id);
            let info = { id: element.id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie };
            array.push(info);
        }
    }
    return array;
}

exports.allUserInfoWithResearch = (id, research) => { //l'argument research est une string du nom
    //TODO selectioner dabbord l'id dans la prelier table pour ensuite recuperer les infos, la recupertaiton des id se fait avec la recherche mais pas le reste
    //recuperation des id
    research = "%" + research + "%"
    let array = [];
    var ids = db.prepare('SELECT id FROM userLogin WHERE nameUser LIKE ?').all(research);
    for(var element of ids){
        if(id !== element.id && !this.isRequest(element.id, id)&& !this.isRequest(id, element.id) && !this.isFriends(id, element.id)){
            let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.id);
            let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.id);
            let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.id);
            let info = { id: element.id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie };
            array.push(info);
        }
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

    var deleting = db.prepare('DELETE FROM userProfil WHERE id = ' + id).run();
    var insertLogin = db.prepare('INSERT INTO userProfil VALUES (@id, @photo_de_profil, @biographie, @etudes, @contact)');
    var value = {id : id, photo_de_profil : photo, biographie: biographie, etudes : etudes, contact : contact};
    insertLogin.run(value);
}

/*** partie friends***/

//concidere comme requete quand ils sont ami que dans un sens, concidere ami quand ils sont ami dans les 2 sens
exports.request = (id, idOtherUser )=> {

    if (this.isRequest(id, idOtherUser)){
        return false;
    }
    var insertFriends = db.prepare('INSERT INTO userFriends VALUES (@id, @friends)');
    var value = {id : id, friends : idOtherUser};
    insertFriends.run(value);
    return true;
}

exports.isFriends = (id, idOtherUser )=> {
    let testOtherId = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(idOtherUser, id);
    let testOtherId2 = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(id, idOtherUser);
    return testOtherId !== undefined && testOtherId2 !== undefined;
}

exports.isRequest = (idUse, idOtherUser )=> {
    let testOtherId = db.prepare('SELECT id FROM userFriends WHERE  id = ? and friends = ?').get(idUse, idOtherUser);
    let testOtherId2 = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(idUse, idOtherUser);
    return testOtherId !== undefined && testOtherId2 === undefined;
}

exports.allFriends = (id) => {
    let array = [];
    var ids = db.prepare('SELECT friends FROM userFriends where id = ?').all(id);
    if(ids.size === 0){
        return array;
    }
    for(var element of ids){
        if(this.isFriends(id, element.friends)){
            let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.friends);
            let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.friends);
            let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.friends);
            let roomID = this.roomID(id, element.friends);
            let info = { id: element.friends, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie, roomID : roomID };
            array.push(info);
        }
    }
    return array;
}

exports.allRequestIn = (id) => {
    let array = [];
    var ids = db.prepare('SELECT id FROM userFriends where friends = ?').all(id);

    if(ids.size === 0){
        return array;
    }
    for(var element of ids){
        if(!this.isFriends(element.id, id)){

            let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.id);
            let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.id);
            let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.id);
            let info = { id: element.id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie };
            array.push(info);
        }
    }
    return array;
}


exports.delete = (id, idOtherUser )=> {
    db.prepare('DELETE FROM userFriends WHERE friends = ? and id = ?').run(idOtherUser, id);
}

////CHAT///////

exports.addConversation = (id1, id2, text )=> {// envoie d'un message de id1 vers id2
    
    db.prepare('INSERT INTO chat VALUES(@id1, @id2, @message, NOW()').run({id1 : id1, id2 : id2, message : text});

}

exports.roomID = (id1, id2)=> {// renvoie la concatenation de id1 et id2, concaténé en ordre croissant
    let result = "";
    if(id1 > id2){
        return result + id2 + id2;
    }
    return result + id1 + id2;
}

exports.getConversation = (id1, id2)=> {
    //todo recuperer une conversation
    let conversation = db.prepare('SELECT message FROM chat WHERE id1 = ? AND id2 = ? ORDER BY date').get(id1, id2);
    return conversation
}

exports.otherID = (chatID, id)=> {// -1 not in 1 a gauche 2 a droite
    if(chatID.indexOf(id, 0)){
        return parseInt(chatID.substring(id.size+1, chatID.size));
    }
    if(chatID.indexOf(id, chatID.size - id.size)){
        return parseInt(chatID.substring(0, chatID.size- id.size));
    }
    return -1;
}

