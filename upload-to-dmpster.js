var argv = require('minimist')(process.argv.slice(2));
var dir = require('node-dir');
var fs = require('fs');

var config = require('./config');
var uploadSingleDumpFile = require('./lib/upload-single-dumpfile.js');

var dmpFileName = argv.f;
var dmpDir = argv.d;
var tags = argv.t || "";

if (!dmpFileName && !dmpDir) {
  throw "ERROR: Dump file name parameter -f or dump file directory parameter -d missing!";
}
if (dmpFileName && dmpDir) {
  throw "ERROR: Only one of the parameters -f and -d can be used at a time!";
}

if (!config.uploadUrl) {
  throw "ERROR: Configuration entry 'uploadUrl' missing! Check your config.js file.";
}
console.log("Upload URL: '" + config.uploadUrl + "'");

if (dmpFileName) {
  console.log("Filename:   '" + dmpFileName + "'");
  console.log("Tags:       '" + tags + "'");
  
  uploadSingleDumpFile(config.uploadUrl, dmpFileName, tags, function(err, result) {
    if (err) {
      throw "ERROR: " + err;
    }
    else {
      console.log("SUCCESS!");
      console.log(result);
      console.log("Dump File URL: " + config.baseUrl + result.url);
    }
  });
}
else {
  findDmpFiles(dmpDir, function(err, dmpFiles) {
    if (err) {
      throw "ERROR: " + err;
    }
    else {
      var dmpFilesRemaining = dmpFiles.length;
      dmpFiles.forEach(function(dmpFileName) {
        
        console.log("Uploading file '" + dmpFileName + "' ...");
        
        uploadSingleDumpFile(config.uploadUrl, dmpFileName, tags, function(err, result) {
          if (err) {
            console.log("UPLOAD FAILED  : '" + dmpFileName + "'  (" + err + ")");
          }
          else {
            console.log("UPLOAD finished: '" + dmpFileName + "' ", result);
            // TODO: Handler
          }
          dmpFilesRemaining--;
          if (dmpFilesRemaining == 0) {
            console.log("FINISHED.");
          }
        });
        
      });
      
    }
  });
}

function findDmpFiles(directoryName, callback/*(err, dmpFiles)*/) {
  fs.exists(dmpDir, function(exists) {
    if (!exists) {
      callback("The directory '" + dmpDir + "' does not exist!");
    }
    else {
      dir.files(dmpDir, function(err, files) {
        if (err) {
          callback("Failed finding .dmp files! ('" + err + "')");
        }
        else {
          dmpFiles = files.filter(function(filename) {
            return filename && (filename.indexOf(".dmp") == (filename.length - ".dmp".length));
          });
          callback(undefined, dmpFiles);
        }
      });
    }
  });
}

