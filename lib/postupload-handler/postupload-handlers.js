var async = require('async');
var PluginRegistry = require('../plugin-registry.js');

module.exports = new PostUploadHandlers();

PostUploadHandlers.prototype = new PluginRegistry();

function PostUploadHandlers() {
  
  PluginRegistry.call(this); 
  
  this.pluginKind = "postupload-handler";
  this.basePath = "./postupload-handler/";
  
  this.invokeHandlers = function(resultObject, callback) {
    var resultObjects = null;
    
    if ((typeof(resultObject.length) == "number")) {
      resultObjects = resultObject; 
    }
    else if (typeof(resultObject) == "object") {
      resultObjects = [ resultObject ]; 
    }
    else {
      callback("ResultObject is not an array and not an object!");
    }
    if (resultObjects) {
      this.invokeHandlersForArray(resultObjects, callback);
    }
  };
  
  
  this.invokeHandlersForArray = function(resultObjects, callback) {
    var that = this;
    
    async.each(
        resultObjects,
        function(currentResultObject, callback) {
          async.waterfall(
              [ function(callback) { callback(null, currentResultObject); }].concat(that.pluginFunctions),
              callback);
        },
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, resultObjects);
          };
        });
  };

};
