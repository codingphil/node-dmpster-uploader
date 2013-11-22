
module.exports = PluginRegistry;

function PluginRegistry() {
  
  this.pluginFunctions = [];
  this.basePath = "./";
  
  function createPluginConfig(plugin) {
    var pluginConfig = null;
    if (typeof(plugin) === "string") {
      pluginConfig = { name: plugin };
    }
    else if (typeof(plugin) === "object") {
      if (plugin.name) {
        pluginConfig = plugin;
      }
    }
    return pluginConfig;
  };
  
  this.load = function(pluginConfigList) {
    var plugins = pluginConfigList || [];
    var currPluginFunctionFactory;
    var currPluginFunction;
    var currPluginConfig;
    var that = this;
    plugins.forEach(function(currPlugin) {
      try {
        currPluginConfig = createPluginConfig(currPlugin);
        currPluginFunctionFactory = require(that.basePath + currPluginConfig.name + ".js");
        if (typeof(currPluginFunctionFactory) === "function") {
          currPluginFunction = currPluginFunctionFactory(currPluginConfig);
          that.pluginFunctions.push(currPluginFunction);
          console.log("Loaded " + that.pluginKind + " '" + currPluginConfig.name + "'");
        }
      }
      catch (ex) {
        console.error("ERROR: Cannot load " + that.pluginKind + " '" + currPlugin + "' (" + ex + ")");
      }
    });
    console.log("Loaded " + that.pluginFunctions.length + " "+ that.pluginKind + "s");
  };
  
  this.isEmpty = function() {
    return (typeof(this.pluginFunctions) === "undefined") || (this.pluginFunctions.length == 0);
  };
  
};