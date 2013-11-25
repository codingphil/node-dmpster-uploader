
module.exports = function(taggerConfig) {
  
  if (!taggerConfig.varName)
  {
    throw "Tagger config entry 'varName' missing!";
  }
  
  return function(fileObject, callback) {
    var envVarValue = process.env[taggerConfig.varName] || "";
    var formatter = taggerConfig.formatter;
    if (envVarValue && (typeof(formatter) == "function")) {
      envVarValue = formatter(envVarValue);
    }
    callback(null, envVarValue);
  };
  
};
