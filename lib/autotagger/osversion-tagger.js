
var os = require('os');

module.exports = function(fileObject, callback) {
  
  var tag = "";
  
  if (os.type) {
    var osType = os.type() || "UnknownOS"; 
    if (osType.indexOf("Windows") == 0) {
      tag = tag + "Win";
    }
    else {
      tag = tag + osType;
    }
  }
  
  if (os.release) {
    tag = tag + "-" + os.release();
  }
  
  if (os.arch) {
    tag = tag + "_" + os.arch();
  }
  
  callback(null, tag);
};