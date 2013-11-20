
module.exports = new UploadFileLogger();

function UploadFileLogger() {
  
  this.uploadStarted = function(fileObject) {
    console.log(  "UPLOADING -> '" + fileObject.fullPath + "' ...");
  };
  
  this.uploadFinished = function(fileObject, err, result) {
    if (err) {
      console.log("FAILED    <- '" + fileObject.fullPath + "'  (" + err + ")");
    }
    else {
      console.log("FINISHED  <- '" + fileObject.fullPath + "' " + result.url);
    }
  };
  
};

