
var findDumpFiles = require("../../lib/find-dumpfiles.js");

var publicDir = process.env.PUBLIC;

if (!publicDir) {
  throw "Environment variable %PUBLIC% is not set!";
}

findDumpFiles(publicDir, function(err, files) {
  if (err) {
    console.error("ERROR: " + err);
  }
  else {
    console.log("Finding dump files was successful.");
    console.log(files);
  }
});

