
var os = require('os');

module.exports = function(taggerConfig) {
  
  function defaultFormatter(osType, osRelease) {
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
    
    return tag;
  }
  
  return function(fileObject, callback) {
  
    var formatter = taggerConfig.formatter || defaultFormatter;
    var tag = formatter(os.type(), os.release());
    
    callback(null, tag);
  };
};