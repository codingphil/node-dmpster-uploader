var os = require('os');

module.exports = function(taggerConfig) {
  
  return function(fileObject, callback) {
    if (typeof(os.hostname) == "function") {
      callback(null, os.hostname());
    }
    else {
      callback("Cannot retrieve the machine name!");
    }
  };
};
