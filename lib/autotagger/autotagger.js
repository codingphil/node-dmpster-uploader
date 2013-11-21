
var async = require('async');

module.exports = AutoTagger;

function AutoTagger(config) {
  
  this.taggerFunctions = [];
  
  this.load = function() {
    var taggerNames = config.autotagger || [];
    var currTaggerFunction;
    var that = this;
    taggerNames.forEach(function(currTaggerName) {
      try {
        currTaggerFunction = require("./" + currTaggerName + ".js");
        if (currTaggerFunction && (typeof(currTaggerFunction) === "function")) {
          that.taggerFunctions.push(currTaggerFunction);
          console.log("Loaded autotagger '" + currTaggerName + "'");
        }
      }
      catch (ex) {
        console.error("ERROR: Cannot load autotagger '" + currTaggerName + "' (" + ex + ")");
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