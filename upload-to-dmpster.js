var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var async = require('async');

var uploadSingleDumpFile = require('./lib/upload-single-dumpfile.js');
var findDumpFiles = require('./lib/find-dumpfiles.js');
var uploadFileLogger = require('./lib/upload-file-logger.js');
var FileObject = require('./lib/file-object.js');

var dmpFileName = argv.f;
var dmpDir = argv.d;
var tags = argv.t || "";
var customConfigFile = argv.config || argv.c;
var deleteAfterUpload = argv["delete"];
var summaryFileName = argv.s;

var directoryDepth = argv["directoryDepth"];
if (typeof(directoryDepth) === "undefined") {
  directoryDepth = -1;
}

function exitWithError(errorMessage) {
  console.error("ERROR: " + errorMessage);
  process.exit(-1);
}

if (!dmpFileName && !dmpDir) {
  exitWithError("Dump file name parameter -f or dump file directory parameter -d missing!");
}
if (dmpFileName && dmpDir) {
  exitWithError("Only one of the parameters -f and -d can be used at a time!");
}

var configFileName = customConfigFile || './config.js';
if (!fs.existsSync(configFileName)) {
  exitWithError("Config file '" + customConfigFile + "' does not exist!");
}
console.log("Config File: " + configFileName);
var config = require(configFileName);

if (!config.uploadUrl) {
  exitWithError("Configuration entry 'uploadUrl' missing! Check your config.js file.");
}

config.dmpsterUrl = config.baseUrl + "/dmpster";

console.log("Upload URL: '" + config.uploadUrl + "'");

var maxParallelUploads = config.maxParallelUploads || argv.p || 2;

var autoTagger = require('./lib/autotagger/autotagger.js');
autoTagger.load(config.autotagger || []);

var postUploadHandlers = require('./lib/postupload-handler/postupload-handlers.js');
var postUploadHandlersConfigList = config.postupload || [];
if (deleteAfterUpload && (postUploadHandlersConfigList.indexOf("postupload-delete") == -1)) {
  postUploadHandlersConfigList.push("postupload-delete");
}
postUploadHandlers.load(postUploadHandlersConfigList);

var summaryWriter;
if (summaryFileName) {
  console.log("Summary File: " + summaryFileName);
  try {
    summaryWriter = require("./lib/upload-summary-writer")(config);
  }
  catch (ex) {
    exitWithError("Could not initialize the summary writer module! (" + ex + ")");
  }
}

function uploadAndLogSingleDumpFile(dmpFileObject, callback) {
  uploadFileLogger.uploadStarted(dmpFileObject);
  uploadSingleDumpFile(config.uploadUrl, dmpFileObject, dmpFileObject.tags || tags, function(err, result) {
    uploadFileLogger.uploadFinished(dmpFileObject, err, result);
    if (result) {
      result.fileObject = dmpFileObject;
      result.url = config.baseUrl + result.url;
    }
    callback(null, result);
  });
}

function createSingleFileObjectArray(filePath, callback) {
  fs.stat(filePath, function(err, stat) {
    if (err) {
      callback("The file '" + filePath + "' does not exist!");
    }
    else {
      callback(null, [ new FileObject(filePath, stat) ]);
    }
  });
}

function addAutoTagsToDumpFiles(dmpFileObjects, callback) {
  async.map(
    dmpFileObjects,
    function(currDumpFileObject, callback) {
      autoTagger.createTagsForDump(tags, currDumpFileObject, function(err, resultTags) {
        if (err) {
          callback(err);
        }
        else {
          currDumpFileObject.tags = resultTags;
          callback(null, currDumpFileObject);
        }
      });
    },
    callback);
}

function invokePostUploadHandlers(results, callback) {
  if (postUploadHandlers.isEmpty()) {
    callback(null, results);
  }
  else {
    console.log("Post-upload-handlers ...");
    postUploadHandlers.invokeHandlers(results, function(err, invokeResult) {
      console.log("Post-upload-handlers finished.");
      callback(err, results);
    });
  }
}

function uploadMultipleDumpFiles(dmpFileObjects, callback) {
  async.mapLimit(dmpFileObjects, maxParallelUploads, uploadAndLogSingleDumpFile, function(err, results) {
    callback(err, results);
  });
}

function filterSuccessfulResults(uploadResults, callback) {
  var filteredResults = uploadResults.filter(function(result) { return result; });
  callback(null, filteredResults);
}

function sortFileObjects(fileObjects, callback) {
  var sortedFileObjects = fileObjects.sort(function(lhs, rhs) {
    return lhs.fullPath.localeCompare(rhs.fullPath);
  });
  callback(null, sortedFileObjects);
}

function formatFileSize(fileSize) {
  var sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  return sizeMB + " MB";
}

function printFileNames(files, callback) {
  
  var totalSize = files.reduce(function(previous, current) { return previous + current.size; }, 0);
  
  console.log();
  console.log("Found " + files.length + " dump files (" + formatFileSize(totalSize) + "):");
  files.forEach(function(currFileObject) {
    console.log("  " + currFileObject.fullPath + " (" + formatFileSize(currFileObject.size) + ")");
  });
  console.log();
  
  callback(null, files);
}


function writeSummaryFile(results, callback) {
  if (summaryWriter) {
    summaryWriter.writeSummary(results, summaryFileName, function(err) {
      if (err) {
        callback(err);
      }
      else {
        callback(null, results);
      }
    });
  }
  else {
    callback(null, results);
  }
}

function finishUploadResultsHandler(err, results) {
  if (err) {
    exitWithError("Uploading dump files failed. " + err);
  }
  else {
    console.log();
    console.log("SUCCESS! Uploading dump files finished.");
    console.log(results);
  }
}

var fileFindAsyncFunction;

if (dmpFileName) {
  console.log("Filename:   '" + dmpFileName + "'");
  console.log("Tags:       '" + tags + "'");
  
  fileFindAsyncFunction = function(callback) {
    createSingleFileObjectArray(dmpFileName, callback);
  };
}
else {
  console.log("Directory:  '" + dmpDir + "'");
  console.log("Directory Depth: " + ((directoryDepth >= 0) ? directoryDepth : "UNLIMITED"));
  console.log("Tags:       '" + tags + "'");
  
  fileFindAsyncFunction = function(callback) {
    findDumpFiles(dmpDir, directoryDepth, callback);
  };
  
}

async.waterfall(
    [
      fileFindAsyncFunction,
      sortFileObjects,
      printFileNames,
      addAutoTagsToDumpFiles,
      uploadMultipleDumpFiles,
      filterSuccessfulResults,
      invokePostUploadHandlers,
      writeSummaryFile
    ],
    finishUploadResultsHandler);

