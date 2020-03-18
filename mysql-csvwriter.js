const mysql = require("mysql");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

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
  connection.query("SELECT * FROM user", function (error, data, fields) {
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

    //console.log('jsonData ==> ', jsonData)

    const csvWriter = createCsvWriter({
      path: 'exports/user_list' + '_' + Date.now() + '.csv',
      header: [
        {id: "id", title: "id"},
        {id: "email", title: "email"},
        {id: "full_name", title: "full_name"},
        {id: "phone", title: "phone"},
        {id: "type", title: "type"}
      ]
    });

    csvWriter
      .writeRecords(jsonData)
      .then(() =>
        console.log("Write to user_list.csv successfully!")
      );
  });

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
  /*var data1 = '';
  for (let i = 0; i < jsonData.length; i++) {
    data1 = data1 + jsonData[i].id + '\t' + jsonData[i].email + '\t' + jsonData[i].full_name + '\t' + jsonData[i].phone + '\t' + jsonData[i].type + '\n';
  }
  fs.appendFile('exports/user_list' + '_' + Date.now() + '.xls', data1, (err) => {
    if (err) throw err;
    console.log('Excel file created');
  })*/
});
