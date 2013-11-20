
module.exports = new UploadFileLogger();

function UploadFileLogger() {
  
  this.uploadStarted = function(filename) {
    console.log(  "Uploading file   '" + filename + "' ...");
  };
  
  this.uploadFinished = function(filename, err, result) {
    if (err) {
      console.log("UPLOAD FAILED  : '" + filename + "'  (" + err + ")");
    }
    else {
      console.log("UPLOAD finished: '" + filename + "' ", result);
    }
  };
  
};

