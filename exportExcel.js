const mysql = require("mysql");
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'abc',
  user: 'abx',
  password: 'fdg',
  database: 'fdgdgdg'
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;

  // query data from MySQL
  connection.query('SELECT id as Id, email as Email, full_name as FullName, phone as Phone, type as Type FROM user',
                  function (error, data, fields) {

    if (error) throw error;

    const jsonData = JSON.parse(JSON.stringify(data));

    function replaceByValue(field, oldvalue, newvalue) {
      for (let k = 0; k < jsonData.length; ++k) {
        if (oldvalue == jsonData[k][field]) {
          jsonData[k][field] = newvalue;
        }
      }
      return jsonData;
    }

    replaceByValue('type', '0', 'admin');
    replaceByValue('type', '1', 'employer');
    replaceByValue('type', '2', 'employee');

    let finalHeaders = [];

    // create workbook
       let wb = XLSX.utils.book_new();

    // for each to write into excel sheets.

    for (let i = 0; i < jsonData.length; i++) {
      let ws = XLSX.utils.json_to_sheet(jsonData, {header: finalHeaders});
      XLSX.utils.book_append_sheet(wb, ws, `SheetJS_${i}`)
    }

    // file name of the excel sheet
    let exportFileName = 'exports/user_list' + '_' + Date.now() + '.xls';

    // create excel sheet
    XLSX.writeFile(wb, exportFileName)

    setInterval(function () {
      walkDir('exports/', function (filePath) {
        fs.stat(filePath, function (err, stat) {
          const now = new Date().getTime();
          const endTime = new Date(stat.mtime).getTime() + 60000;
          if (err) {
            return console.error(err);
          }
          if (now > endTime) {
            return fs.unlink(filePath, function (err) {
              if (err) return console.error(err);
              console.log('File deleted!!!')
            });
          }
        })
      });
    }, 60000); // every 1 minute

    function walkDir(dir, callback) {
      fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
          walkDir(dirPath, callback) : callback(path.join(dir, f));
      });
    }
  });
});
