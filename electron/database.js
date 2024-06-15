const { app } = require("electron");
const sqlite3 = require("sqlite3");
const path = require("node:path");
const fse = require("fs-extra");
var dbPath;
var db = null;

if (app.isPackaged) {
  dbPath = path.resolve("./resources/storage/data.db");
} else {
  dbPath = path.join(__dirname, "./storage/data.db");
}
fse.ensureFileSync(dbPath);


const SQLiteInit = () => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) throw err;
  });
};


const createTable = () => {
  return new Promise((resolve) => {    
    db.serialize(function() {
      db.run(`
      create table if not exists fav_class (
        class_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        class_name text
      );
    `, (err, data) => {
      if (err) throw err;
      resolve(data);
    });
      db.serialize(function() {
        db.run(`
        create table if not exists fav_list (
          fav_id INTEGER PRIMARY KEY AUTOINCREMENT, 
          class_id INTEGER,
          fav_title text,
          fav_url text      
        );
      `, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
     });
      
     });

  })

}
const runSql = (sql) => {
  return new Promise((resolve) => {
    db.all(sql, (err, data) => {
      if (err) throw err;
      resolve(data);
    });
  });
};

module.exports = {
  SQLiteInit,
  createTable,  
  runSql,
};