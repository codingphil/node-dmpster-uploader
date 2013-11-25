module.exports = (function() {
  
  var fs = require('fs');
  var FileObject = require('./file-object.js');
  
  function fileFilter(file) {
    var fileExt = ".dmp"; 
    return file.indexOf(fileExt, file.length - fileExt.length) !== -1;
  }
  
  var walk = function(dir, actDepth, maxDepth, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      
      if (err) {
        // TODO: Error callback/list
        console.error("ERROR: Cannot read directory '" + dir + "'! (" + err + ")");
        return done(null, results);
      }
      
      var pending = list.length;
      if (!pending) {
        return done(null, results);
      }
      
      list.forEach(function(file) {
        file = dir + '/' + file;
        fs.stat(file, function(err, stat) {
          if (err) {
            // TODO: Error callback/list
            console.error("ERROR: Cannot get file info '" + file + "'! (" + err + ")");
          }
          if (stat && stat.isDirectory()) {
            if ((maxDepth < 0) || (actDepth < maxDepth)) {
              walk(file, actDepth + 1, maxDepth, function(err, res) {
                if (res) {
                  results = results.concat(res);
                }
                if (!--pending) {
                  done(null, results);
                }
              });
            }
            else {
              if (!--pending) {
                done(null, results);
              }
            }
          } else {
            if (fileFilter(file)) {
              results.push(new FileObject(file, stat));
            }
            if (!--pending) {
              done(null, results);
            }
          }
        });
      });
    });
  };
  
  return function(dir, maxDepth, callback) {
    return walk(dir, 0, maxDepth, callback);
  };
  
})();
