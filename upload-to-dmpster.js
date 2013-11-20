var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');

var config = require('./config');
var uploadSingleDumpFile = require('./lib/upload-single-dumpfile.js');
var findDumpFiles = require('./lib/find-dumpfiles');

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
  findDumpFiles(dmpDir, function(err, dmpFiles) {
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
