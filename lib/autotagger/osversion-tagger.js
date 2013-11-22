
var os = require('os');

module.exports = function(taggerConfig) {
  
  function defaultFormatter(osType, osRelease, osArch) {
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
    
    return tag;
  }
  
  return function(fileObject, callback) {
  
    var formatter = taggerConfig.formatter || defaultFormatter;
    var tag = formatter(os.type(), os.release(), os.arch());
    
    callback(null, tag);
  };
};