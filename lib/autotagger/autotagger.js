
var async = require('async');

module.exports = AutoTagger;

function AutoTagger(config) {
  
  this.taggerFunctions = [];
  
  function createTaggerConfig(tagger) {
    var taggerConfig;
    if (typeof(tagger) === "string") {
      taggerConfig = { name: tagger };
    }
    else if (typeof(tagger) === "object") {
      if (tagger.name) {
        taggerConfig = tagger;
      }
    }
    return taggerConfig;
  }
  
  this.load = function() {
    var taggerNames = config.autotagger || [];
    var currTaggerFunctionFactory;
    var currTaggerFunction;
    var currTaggerConfig;
    var that = this;
    taggerNames.forEach(function(currTagger) {
      try {
        currTaggerConfig = createTaggerConfig(currTagger);
        currTaggerFunctionFactory = require("./" + currTaggerConfig.name + ".js");
        if (typeof(currTaggerFunctionFactory) === "function") {
          currTaggerFunction = currTaggerFunctionFactory(currTaggerConfig);
          that.taggerFunctions.push(currTaggerFunction);
          console.log("Loaded autotagger '" + currTaggerConfig.name + "'");
        }
      }
      catch (ex) {
        console.error("ERROR: Cannot load autotagger '" + currTagger + "' (" + ex + ")");
      }
    });
  };

  this.createTagsForDump = function(initialTags, dumpFileObject, callback) {
    var that = this;
    
    async.reduce(that.taggerFunctions, initialTags, function(oldTags, currTagger, callback) {
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