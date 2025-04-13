function generateTrackingNumber() {
    return 'TRK-' + Math.floor(Math.random() * 1000000);
  }

module.exports = { generateTrackingNumber };


