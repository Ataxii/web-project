var sqlite = require('better-sqlite3');
var db = new sqlite.Database('main.db', err =>{
    if (err)
        throw err
    console.log('Databse started on ' + db)
})

db.close(err => {
    if (err)
        throw err
    console('Datebase closed.')
})

db.prepare('DROP TABLE IF EXISTS userLogin').run();
db.prepare('DROP TABLE IF EXISTS userProfil').run();

db.prepare('CREATE TABLE userLogin (id INTEGER PRIMARY KEY, nameUser TEXT, passUser TEXT)').run();
db.prepare('CREATE TABLE userProfil (id INTEGER PRIMARY KEY, photo_de_profil TEXT, biographie TEXT, etudes TEXT, contact TEXT)').run();





