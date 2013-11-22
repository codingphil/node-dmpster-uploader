/**
 * Creates a HTML file with a link to the dump details page on dmpster
 * 
 * Config:
 *   - "template": The filename of the EJS (HTML) template.
 *   - "baseUrl": The dmpster base url (e.g. "http://localhost" if dumpster is "http://localhost/dmpster") 
 */
var ejs = require('ejs');
var fs = require('fs');

module.exports = function(handlerConfig) {
  
  if (typeof(handlerConfig.template) === "undefined") {
    throw "config entry 'template' is missing!";
  }
  if (typeof(handlerConfig.baseUrl) === "undefined") {
    throw "config entry 'baseUrl' is missing!";
  }
  
  this.ejsTemplate = null;
  
  this.compileTemplate = function(fileContent, callback) {
    try {
      this.ejsTemplate = ejs.compile(fileContent);
      callback(null, this.ejsTemplate);
    }
    catch (ex) {
      callback(ex);
    }
  };
  
  this.createEJSTemplate = function(templateFilename, callback) {
    fs.stat(templateFilename, function(err, stat) {
      if (err) {
        callback("The HTML template file '" + templateFilename + "' does not exist!");
      }
      else {
        fs.readFile(templateFilename, { encoding: 'utf8' }, function (err, fileContent) {
          if (err) {
            callback("Failed reading the HTML template file '" + templateFilename + "'! (" + err + ")");
          }
          else {
            compileTemplate(fileContent, callback);  
          }
        });
      }
    });
  };
  
  this.getEJSTemplate = function(callback) {
    if (this.ejsTemplate) {
      callback(null, this.ejsTemplate);
    }
    else {
      this.ejsTemplate = createEJSTemplate(handlerConfig.template, function(err, template) {
        if (err) {
          callback("Failed creating dump HTML template! (" + err + ")");
        }
        else {
          callback(null, template);
        }
      });
    }
  };
  
  return function(resultObject, callback) {
    console.log("postupload-createhtmlfile: " + resultObject.fileObject.fullPath);
    this.getEJSTemplate(function(err, ejsTemplate) {
      var renderedContent = null;
      if (err) {
        callback(err);
      }
      else {
        try {
          renderedContent = ejsTemplate({
            dump: resultObject,
            baseUrl: handlerConfig.baseUrl
          });
        }
        catch (ex) {
          callback("Failed rendering the dump HTML file! (" + ex + ")");
        }
        
        if (renderedContent) {
          if (resultObject.fileObject && resultObject.fileObject.fullPath) {
            fs.writeFile(resultObject.fileObject.fullPath + ".html", renderedContent, function(err) {
              if (err) {
                callback(err);
              }
              else {
                callback(null, resultObject);
              }
            });
          }
          else {
            callback("Full path of upload result is missing!");
          }
        }
        
      }
    });
  };
  
};
