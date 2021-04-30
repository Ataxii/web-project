"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');
const fs = require('fs');
let db = new Sqlite('../sqLite/main.db');



//sauvegarder le userID dans un fichié text pour pas perdre la suite des futurs id
exports.writeID = (id) => {
    db.prepare('DELETE FROM saveid').run();
    db.prepare('INSERT INTO saveid VALUES (@id)').run({id : id});
}

exports.readID = () => {
    let id = db.prepare('SELECT id FROM saveid').get();
    return parseInt(id.id);
}
let reading = this.readID();
let idUser = reading;

//recupere depuis le fichier json le nom de toutes les universitées en france
exports.universityList = () => {
    let university = JSON.parse(fs.readFileSync("E:\\Fac\\L2\\semestre2\\web\\web-project-for-windows\\universityList.json"));
    let result = [];
    for(let univ of university){
      result.push({name : univ.fields.uo_lib_officiel})
    }
    return result
}
//enregistre l'utilisateur en regardant avant si il est pas deja enregistré
exports.register = (nameUser, passUser) => {
    if (this.isRegister(nameUser)) {
        return false;
    }
    let prepare = db.prepare('INSERT INTO userLogin VALUES (@id, @nameUser, @passUser)');
    prepare.run({ id: idUser, nameUser: nameUser, passUser: passUser });
    //on initialise l'utilisateur avec des valeur " " pour pas qu'il n'y ai d'erreur
    this.modification(idUser, " ", " ", " ", " ", " " );
    idUser++;
    this.writeID(idUser);
    return true;
}

//test si l'utilisateur est deja dans la base de donné
exports.isRegister = (nameUser) => {
    let pseudolog = db.prepare('SELECT id FROM userLogin WHERE nameUser = ?').get(nameUser);

    return pseudolog !== undefined;

}

//test si l'utilisateur peut se connecter ( si il est deja inscrit) et si le mot de passe correspond à son profil
exports.login = (nameUser, passUser) => {
    let idlog = db.prepare('SELECT id FROM userLogin WHERE nameUser = ? AND passUser = ?').get(nameUser, passUser);
    if(idlog === undefined){
        return 0;
    }

    if (idlog.id !== undefined) {
        return idlog.id;
    } else return 0;
}

//on a definie que le password serait de longueur > 8 pour assurer une certaine securité
exports.lenghtPassword = ( passUser) => {
    if (passUser.length < 8){
        return -1;
    }
}

// fonction qui récup tout les utilisateurs (id, photo, pseudo, bio, univ) tableau de tableau
exports.allUserInfo = (id) => {

    let array = [];
    var ids = db.prepare('SELECT id FROM userProfil').all();
    for(var element of ids){
        if(id !== element.id && !this.isRequest(element.id, id)&& !this.isRequest(id, element.id) && !this.isFriends(id, element.id)){
            let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.id);
            let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.id);
            let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.id);
            let univ = db.prepare('SELECT university FROM userProfil WHERE id = ?').get(element.id);
            let info = { id: element.id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie, univ : univ.university };
            array.push(info);
        }
    }
    return array;
}

// fonction qui récup tout les utilisateurs qui correspondent à la recherche (id, photo, pseudo, bio, univ) tableau de tableau
exports.allUserInfoWithResearch = (id, research) => { //l'argument research est une string du nom
   //recuperation des id
    research = "%" + research + "%"
    let array = [];
    var ids = db.prepare('SELECT id FROM userLogin WHERE nameUser LIKE ?').all(research);
    for(var element of ids){
        if(id !== element.id && !this.isRequest(element.id, id)&& !this.isRequest(id, element.id) && !this.isFriends(id, element.id)){
            let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(element.id);
            let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(element.id);
            let bio = db.prepare('SELECT biographie FROM userProfil WHERE id = ? ').get(element.id);
            let univ = db.prepare('SELECT university FROM userProfil WHERE id = ?').get(element.id);
            let info = { id: element.id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie, univ : univ.university };
            array.push(info);
        }
    }
    return array;
}

//recupere toutes les infos possibles sur un seul utilisateur
exports.userInfo = (id) => {

    let pseudo = db.prepare('SELECT nameUser FROM userLogin WHERE id = ? ').get(id);
    let photo = db.prepare('SELECT photo_de_profil FROM userProfil WHERE id = ? ').get(id);
    let biographie = db.prepare('SELECT biographie FROM userProfil WHERE id = ?').get(id);
    let etudes = db.prepare('SELECT etudes FROM userProfil WHERE id = ?').get(id);
    let contact = db.prepare('SELECT contact FROM userProfil WHERE id = ?').get(id);
    let univ = db.prepare('SELECT university FROM userProfil WHERE id = ?').get(id);
    //securité si jamais rien n'est renseigné
    if(photo === undefined ){
        photo = {nameUser : " "};
    }
    if(biographie === undefined ){
        biographie = {nameUser : " "};
    }
    if(etudes  === undefined ){
        etudes  = {nameUser : " "};
    }
    if(contact === undefined ){
        contact = {nameUser : " "};
    }
    if(univ === undefined ){
        univ = {nameUser : " "};
    }
    return {
        id: id,
        nameUser: pseudo.nameUser,
        photo_de_profil: photo.photo_de_profil,
        biographie: biographie.biographie,
        etudes: etudes.etudes,
        contact: contact.contact,
        univ: univ.university
    };
}

// fonction de modification avec un id et tout les infos,
exports.modification = (id, photo, biographie, etudes, contact, univ)=> {

    var deleting = db.prepare('DELETE FROM userProfil WHERE id = ' + id).run();
    var insertLogin = db.prepare('INSERT INTO userProfil VALUES (@id, @photo_de_profil, @biographie, @etudes, @contact, @university)');
    var value = {id : id, photo_de_profil : photo, biographie: biographie, etudes : etudes, contact : contact, university : univ};
    insertLogin.run(value);
}

/*** partie friends***/
/** EXPLICATION : il n'y a pas 2 etats (demande d'ami et ami) il y a seulement des demandes d'ami, la personne A demande à B
 * si il peut etre son ami, tant que B ne demande pas à A d'être son ami alors ca reste une demande, si B envoi un demande aussi
 * alors A et B sont amis**/

//concidéré comme requète quand ils sont amis que dans un sens, concidéré ami quand ils sont amis dans les 2 sens
exports.request = (id, idOtherUser )=> {

    if (this.isRequest(id, idOtherUser)){
        return false;
    }
    var insertFriends = db.prepare('INSERT INTO userFriends VALUES (@id, @friends)');
    var value = {id : id, friends : idOtherUser};
    insertFriends.run(value);
    return true;
}

//si il existe une ligne pour chaque demande alors c'est qu'ils sont amis
exports.isFriends = (id, idOtherUser )=> {
    let testOtherId = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(idOtherUser, id);
    let testOtherId2 = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(id, idOtherUser);
    return testOtherId !== undefined && testOtherId2 !== undefined;
}

//si il y en a qu'une sur 2 alors ils sont sur demande et donc non amis
exports.isRequest = (idUse, idOtherUser )=> {
    let testOtherId = db.prepare('SELECT id FROM userFriends WHERE  id = ? and friends = ?').get(idUse, idOtherUser);
    let testOtherId2 = db.prepare('SELECT id FROM userFriends WHERE friends = ? and id = ?').get(idUse, idOtherUser);
    return testOtherId !== undefined && testOtherId2 === undefined;
}

//recuperation de tous les amis d'un utilisateur
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

//recupere toutes les demandes d'un utlisateur
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

//supprime un utilisisateur
exports.delete = (id, idOtherUser )=> {
    db.prepare('DELETE FROM userFriends WHERE friends = ? and id = ?').run(idOtherUser, id);
}

////CHAT///////

//sauvegarde du chat
exports.addConversation = (id, text)=> {// id du chat et le text dans le quel le nom de l'utilisateur est marqué
    db.prepare('INSERT INTO chat VALUES(@idchat, @message)').run({idchat : id,  message : text});
}

//recuperation / creation de l'id de room pour 2 utilisateurs amis
exports.roomID = (id1, id2)=> {// renvoie la concatenation de id1 et id2, concaténé en ordre croissant
    let result = "";
    if(id1 > id2){
        return result + id2 + id1;
    }
    return result + id1 + id2;
}

//recupere la conversation d'une room
exports.getConversation = (id)=> {
    return db.prepare('SELECT message FROM chat WHERE idchat = ? ').all(id)
}

exports.otherID = (chatID, id)=> {// -1 not in 1 a gauche 2 a droite
    //conversion obligatoir en string pour pouvoir faire des calcules de longueur dessus
    chatID = chatID + ""
    id = id + ""
    if (id === ""){
        return -1;
    }
    if (chatID.search(id) !== undefined) {//on regarde si la substring de la taille de l'id est identique a l'id avec des substring prisent au debut et a la fin

        let startSub = chatID.substring(0, id.length)
        let endSub = chatID.substring(chatID.length - id.length)

        if (parseInt(startSub) === parseInt(id)) { //l'id est situé au debut donc l'autre id commence a la taille de l'id
            return parseInt(chatID.substring(id.length));
        }
        if (parseInt(endSub) === parseInt(id)){//inversement
            return parseInt(chatID.substring(0, chatID.length - id.length));
        }
    }
    //l'id n'est pas au debut ni a la fin ou n'existe tout simplement pas
    return -1;
}

