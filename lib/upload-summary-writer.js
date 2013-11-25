
module.exports = function(config) {
  return new UploadSummaryWriter(config);
};

var fs = require('fs');
var ejs = require('ejs');
var async = require('async');

function UploadSummaryWriter(config) {
  
  var templateFileName = __dirname + "/../templates/upload-summary.ejs";
  
  this.writeSummary = function(uploads, summaryFileName, callback) {
    
    function renderEJS(templateString, callback) {
      try {
        var result = ejs.render(templateString, { dumps: uploads, dmpsterUrl: config.dmpsterUrl });
        callback(null, result);
      }
      catch (ex) {
        callback(ex);
      }
    }
    
    function writeSummaryFile(content, callback) {
      fs.writeFile(summaryFileName, content, callback);
    }
    
    async.waterfall([
          function(callback) { fs.readFile(templateFileName, { encoding: 'utf8' }, callback); },
          renderEJS,
          writeSummaryFile
        ],
        function(err, results) {
          if (err) {
            callback("Failed to create the summary file '" + summaryFileName + "'! (" + err + ")");
          }
          else {
            callback(null, results);
          }
        });
    
  };
  
}

