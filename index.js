/* jshint strict: global, esversion: 6, node: true */
'use strict';

const http = require('http');
const util = require('util');
const fs = require('fs');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
  if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
    // parse a file upload
    const form = formidable({
      keepExtensions: false,
      maxFileSize: 50 * 1024 * 1024,
      multiples: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log('--------------------- ERROR --------------------------');
        console.err(err);
        return;
      }
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.write('received upload:\n\n');
      res.write(util.inspect({ fields: fields, files: files }));

      // Przesuń plik do folderu
      const uploadDir = './upload_dir/';
      try {
        if (!Array.isArray(files.upload)) {
          files.upload = [files.upload];
        }
        files.upload.forEach((file) => {
          const oldPath = file.path;
          const newPath = `${uploadDir}/${file.name}`;
          fs.renameSync(oldPath, newPath);
        });
      } catch (err) {
        // tylko jeden plik?
        console.error(err);
        try {
          fs.renameSync(files.upload.path, `${uploadDir}/${files.upload.name}`);
        } catch (err2) {
          console.log(`error2: ${err2}`);
        }
      }
      res.write(util.inspect({ upload: files.upload }));

      // Kończ
      res.end();
    });

    return;
  }

  // show a file uplaod form
  res.writeHead(200, { 'content-type': 'text/html' });

  res.end(fs.readFileSync('./index.html'));
});

server.listen(
  {
    host: '192.168.43.74',
    port: 8000,
  },
  () => {
    console.log(`Server listening on ${util.inspect(server.address())}`);
  }
);
