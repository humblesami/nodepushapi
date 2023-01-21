const config = {
    "delay": 1000,
    "maxImageCount": 3,
    "port": 3274,
    "delay": 1000,
    get: function (prop) {
        return this[prop];
    }
};

module.exports = async (req, res, next) => {
    setTimeout(() => next(), config.get("delay"));
};
