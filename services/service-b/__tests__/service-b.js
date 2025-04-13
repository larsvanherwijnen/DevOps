const { generateTrackingNumber } = require("../utils/trackingNumber");

describe("generateTrackingNumber", () => {
  it("should generate a tracking number with the correct format", () => {
    const trackingNumber = generateTrackingNumber();

    // Check that the tracking number starts with "TRK-"
    expect(trackingNumber).toMatch(/^TRK-\d{1,6}$/);

    // Check that the numeric part is within the expected range
    const numericPart = parseInt(trackingNumber.split("-")[1], 10);
    expect(numericPart).toBeGreaterThanOrEqual(0);
    expect(numericPart).toBeLessThan(1000000);
  });

  it("should generate unique tracking numbers", () => {
    const trackingNumbers = new Set();

    // Generate multiple tracking numbers
    for (let i = 0; i < 100; i++) {
      trackingNumbers.add(generateTrackingNumber());
    }

    // Ensure all tracking numbers are unique
    expect(trackingNumbers.size).toBe(100);
  });
});

describe("Math Test", () => {
  it("should return 2 when adding 1 + 1", () => {
    expect(1 + 1).toBe(2);
  });
});
