var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var async = require('async');

var config = require('./config');

var uploadSingleDumpFile = require('./lib/upload-single-dumpfile.js');
var findDumpFiles = require('./lib/find-dumpfiles');

var dmpFileName = argv.f;
var dmpDir = argv.d;
var tags = argv.t || "";
var maxParallelUploads = config.maxParallelUploads || argv.p || 2;

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
  
  function uploadAndLog(dmpFileName, callback) {
    console.log("Uploading file '" + dmpFileName + "' ...");
    
    uploadSingleDumpFile(config.uploadUrl, dmpFileName, tags, function(err, result) {
      if (err) {
        console.log("UPLOAD FAILED  : '" + dmpFileName + "'  (" + err + ")");
      }
      else {
        console.log("UPLOAD finished: '" + dmpFileName + "' ", result);
      }
      callback();
    });
  }
  
  findDumpFiles(dmpDir, function(err, dmpFiles) {
    if (err) {
      throw "ERROR: " + err;
    }
    else {
      async.eachLimit(dmpFiles, maxParallelUploads, uploadAndLog, function(err) {
        if (err) {
          throw "ERROR: Uploading dump files failed. " + err;
        }
        else {
          console.log("SUCCESS! Uploading dump files finished.");
        }
      });
    }
  });
}
