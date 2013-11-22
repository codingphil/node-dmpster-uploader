
module.exports = function(taggerConfig) {
  
  return function(fileObject, callback) {
    if (!taggerConfig.varName)
    {
      callback("Tagger config entry 'varName' missing!");
    }
    else {
      var envVarValue = process.env[taggerConfig.varName] || "";
      var formatter = taggerConfig.formatter;
      if (envVarValue && (typeof(formatter) == "function")) {
        envVarValue = formatter(envVarValue);
      }
      callback(null, envVarValue);
    }
  };
  
};
