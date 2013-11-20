
module.exports = function(filePath, stat) {
  this.fullPath = filePath;
  this.size = stat.size;
};

