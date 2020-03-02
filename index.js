'use strict'

const http        = require('http');
const util        = require('util');
const fs          = require('fs');
const formidable  = require('formidable');

const server = http.createServer((req, res) => {
  if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
    // parse a file upload
    const form = formidable({
      keepExtensions: false,
      maxFileSize: 50 * 1024 * 1024,
      multiples: true
    });

    form.parse(req, (err, fields, files) => {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.write('received upload:\n\n');
      res.write(util.inspect({ fields: fields, files: files }));

      // Przesuń plik do folderu
      const uploadDir = './upload_dir/';
      try {
        if (!Array.isArray(files.upload)) {
          files.upload = [files.upload];
        }
        files.upload.forEach(file => {
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
      res.write(util.inspect({upload: files.upload}));

      // Kończ
      res.end();
    });

    return;
  }

  // show a file uplaod form
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end(`
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/hack-font@3/build/web/hack.css">
<style>
body {
  font-family: Hack, monospace;
  display: flex;
  justify-content: space-between;
}
form {
  background: #ccc;
  width: 600px;
  border: 1px solid black;
  margin: 0 auto;
}
form p {
  line-height: 32px;
  padding-left: 10px;
}
form label,
form button {
  background-color: #7f9ccb;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px ridge black;
  font-size: 0.8rem;
  height: auto;
}
form label:hover,
form button:hover {
  background-color: #2d5ba3;
  color: white;
}
form label:active,
form button:active {
  background-color:#0d3f8f;
  color: white;
}
form img {
  height: 64px;
}
</style>
    <form action="/upload" enctype="multipart/form-data" method="post">
      <label for="upload">Choose images to upload</label>
      <input type="file" id="upload" name="upload" multiple="multiple"><br>
      <div class="preview">
        <p>No files currently selected for upload.</p>
      </div>
      <button>Submit</button>
    </form>
<script>
var input = document.querySelector('input');
var preview = document.querySelector('.preview');

input.style.opacity = 0; // hide it
input.addEventListener('change', updateImageDisplay);

function updateImageDisplay () {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild);
  }

  var curFiles = input.files;
  if (curFiles.length === 0) {
    var para = document.createElement('p');
    para.textContent = 'No files currently selected for upload';
    preview.appendChild(para);
  } else {
    var list = document.createElement('ol');
    preview.appendChild(list);
    for (var i = 0; i < curFiles.length; i++) {
      var listItem = document.createElement('li');
      var para = document.createElement('p');
      if (validFileType(curFiles[i])) {
        para.textContent = 'File name ' + curFiles[i].name + ', file size ' + returnFileSize(curFiles[i].size) + '.';
        var image = document.createElement('img');
        image.src = window.URL.createObjectURL(curFiles[i]);

        listItem.appendChild(image);
        listItem.appendChild(para);
      } else {
        para.textContent = 'File name ' + curFiles[i].name + ': Not a valid file type. Update your selection.';
        listItem.appendChild(para);
      }
      
      list.appendChild(listItem);
    }
  }
}

var fileTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png'
];

function validFileType (file) {
  for (var i = 0; i < fileTypes.length; i++) {
    if (file.type === fileTypes[i]) {
      return true;
    }
  }

  return false;
}

function returnFileSize (number) {
  if (number < 1024) {
    return number + 'bytes';
  } else if (number >= 1024 && number < 1048576) {
    return (number/1024).toFixed(1) + 'KB';
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + 'MB';
  }
}
</script>
   `);
})

server.listen(8081, () => {
  console.log(`Server listening on ${util.inspect(server.address())}`);
});
