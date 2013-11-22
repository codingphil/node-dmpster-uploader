var async = require('async');
var PluginRegistry = require('../plugin-registry.js');

module.exports = new AutoTagger();

AutoTagger.prototype = new PluginRegistry();

function AutoTagger() {
  
  PluginRegistry.call(this); 
  
  this.pluginKind = "autotagger";
  this.basePath = "./autotagger/";
  
  this.createTagsForDump = function(initialTags, dumpFileObject, callback) {
    var that = this;
    
    async.reduce(that.pluginFunctions, initialTags, function(oldTags, currTagger, callback) {
      var newTags = oldTags;
      currTagger(dumpFileObject, function(err, tags) {
        if (err) {
          callback(err);
        }
        else if (tags) {
          if (newTags.length > 0) {
            newTags += ", ";
          }
          newTags += tags;
          callback(null, newTags);
        }
      });
    }, callback);
  };
  
};

