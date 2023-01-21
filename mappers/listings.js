const config = {
  "delay": 1000,
  "maxImageCount": 3,
  "port": 3274,
  "delay": 1000,
  get: function(prop){
    return this[prop];
  }
};

const mapper = listing => {
    const baseUrl = config.get("assetsBaseUrl");
    const mapImage = image => ({
        url: `${baseUrl}${image.fileName}_full.jpg`,
        thumbnailUrl: `${baseUrl}${image.fileName}_thumb.jpg`
    });

    return {
        ...listing,
        images: listing.images.map(mapImage)
    };
};

module.exports = mapper;
