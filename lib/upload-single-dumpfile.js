module.exports = uploadDumpFile;

var http = require('http');
var FormData = require('form-data');
var fs = require('fs');

function uploadDumpFile(uploadUrl, dmpFileObject, tags, callback) {

  fs.exists(dmpFileObject.fullPath, function(exists) {

    if (exists) {

      var dmpFileReadStream = fs.createReadStream(dmpFileObject.fullPath);
      dmpFileReadStream.on('error', function(err) { callback(err); });

      var form = new FormData();
      form.append('file', dmpFileReadStream);
      form.append('tags', tags);

      form.submit(uploadUrl, function(err, res) {
        if (err) {
          callback(err);
        }
        else {
          if (res.statusCode >= 300) {
            callback(res.statusCode + " (" + http.STATUS_CODES[res.statusCode] + ")");
          }
          else {
            readResponse(res, callback);
          }

          res.resume();

        }
      }); 

    }
    else {
      callback("The file '" + dmpFileObject.fullPath + "' does not exist!");
    }

  });

}

function readResponse(res, callback) {
  var responseContent = '';
  var responseObject;

  res.setEncoding('utf8');

  res.on('data', function(chunk) {
    responseContent += chunk;
  });

  res.on('end', function() {
      try {
        responseObject = JSON.parse(responseContent);

        if (responseObject.files &&
            (responseObject.files.length == 1) &&
            (responseObject.files[0])) {
          callback(undefined, responseObject.files[0]);
        }
        else {
          callback("Upload response JSON object is of invalid format!");
        }
      }
      catch(err) {
        callback("Response is no JSON object!");
      }
  });
}
