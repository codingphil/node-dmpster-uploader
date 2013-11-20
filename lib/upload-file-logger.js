
module.exports = new UploadFileLogger();

function UploadFileLogger() {
  
  this.uploadStarted = function(filename) {
    console.log(  "UPLOADING -> '" + filename + "' ...");
  };
  
  this.uploadFinished = function(filename, err, result) {
    if (err) {
      console.log("FAILED    <- '" + filename + "'  (" + err + ")");
    }
    else {
      console.log("FINISHED  <- '" + filename + "' " + result.url);
    }
  };
  
};

