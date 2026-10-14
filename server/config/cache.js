const NodeCache = require('node-cache');

// 5 minutes TTL (300 seconds), check for expired keys every 60 seconds
const searchCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

module.exports = searchCache;
