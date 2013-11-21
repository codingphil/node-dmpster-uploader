
config = module.exports = { };

config.host = 'localhost';
//config.host = 'lnz-spdumpster';

config.baseUrl = "http://" + config.host;
config.uploadUrl = config.baseUrl + '/upload';

config.maxParallelUploads = 2;

config.autotagger = [
    "osversion-tagger",
    "machinename-tagger"
  ];