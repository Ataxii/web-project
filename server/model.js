"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');
const fs = require('fs');
let db = new Sqlite('../sqLite/main.db');



//sauvegarder le userID dans un fichié text
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

exports.register = (nameUser, passUser) => {
    if (this.isRegister(nameUser)) {
        return false;
    }

    let prepare = db.prepare('INSERT INTO userLogin VALUES (@id, @nameUser, @passUser)');
    prepare.run({ id: idUser, nameUser: nameUser, passUser: passUser });
    this.modification(idUser, " ", " ", " ", " ", " " );
    idUser++;
    this.writeID(idUser);
    return true;
}

exports.isRegister = (nameUser) => {
    let pseudolog = db.prepare('SELECT id FROM userLogin WHERE nameUser = ?').get(nameUser);

    return pseudolog !== undefined;

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
            let univ = db.prepare('SELECT university FROM userProfil WHERE id = ?').get(element.id);
            let info = { id: element.id, nameUser: pseudo.nameUser , photo_de_profil : photo.photo_de_profil, biographie: bio.biographie, univ : univ.university };
            array.push(info);
        }
    }
    return array;
}

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

//
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

// fonction create/ set avec un id et tout les infos,
exports.modification = (id, photo, biographie, etudes, contact, univ)=> {

    var deleting = db.prepare('DELETE FROM userProfil WHERE id = ' + id).run();
    var insertLogin = db.prepare('INSERT INTO userProfil VALUES (@id, @photo_de_profil, @biographie, @etudes, @contact, @university)');
    var value = {id : id, photo_de_profil : photo, biographie: biographie, etudes : etudes, contact : contact, university : univ};
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

exports.addConversation = (id, text)=> {// id du chat et le text dans le quel le nom de l'utilisateur est marqué
    db.prepare('INSERT INTO chat VALUES(@idchat, @message)').run({idchat : id,  message : text});
}

exports.roomID = (id1, id2)=> {// renvoie la concatenation de id1 et id2, concaténé en ordre croissant
    let result = "";
    if(id1 > id2){
        return result + id2 + id1;
    }
    return result + id1 + id2;
}

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

