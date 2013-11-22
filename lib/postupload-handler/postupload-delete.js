var fs = require('fs');

module.exports = function(handlerConfig) {
  
  return function(resultObject, callback) {
    console.log("postupload-delete: " + resultObject.fileObject.fullPath);
    var path = resultObject.fileObject.fullPath;
    
    fs.stat(path, function(err, stat) {
      if (err) {
        console.error("ERROR: The file '" + path + "' does not exist!");
        callback(null, resultObject);
      }
      else {
        fs.unlink(path, function(err) {
          if (err) {
            console.error("ERROR: Could not delete the file '" + path + "'! (" + err + ")");
          }
          callback(null, resultObject);
        });
      }
    });
  };
  
};
