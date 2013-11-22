
config = module.exports = { };

config.host = 'localhost';
//config.host = 'lnz-spdumpster';

config.baseUrl = "http://" + config.host;
config.uploadUrl = config.baseUrl + '/upload';

config.maxParallelUploads = 2;

config.autotagger = [
    "osversion-tagger",
    "machinename-tagger",
    {
      name: "envvar-tagger",
      varName: "USERNAME",
      formatter: function(varValue) { return "USER:" + varValue; }
    }
  ];

config.postupload = [
    //"postupload-delete"
  ];