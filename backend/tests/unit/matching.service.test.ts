import { MatchingService } from '../../src/modules/matching/matching.service';
import { prisma } from '../../src/config/database.config';

describe('MatchingService', () => {
  it('should only return certified WAV drivers if requiresAccessibleTier is true', async () => {
    // Arrange
    const mockDrivers = [
      { driverId: 'd1', vehicleId: 'v1', distance: 1200 },
      { driverId: 'd2', vehicleId: 'v2', distance: 2500 }
    ];
    
    // Simulate Prisma returning filtered rows from PostGIS
    (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(mockDrivers);

    // Act
    const result = await MatchingService.findNearbyDrivers(-25.7479, 28.2293, true);

    // Assert
    expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('dp."isAccessibleCertified" = true AND v."isWAV" = true'),
      28.2293, // Longitude
      -25.7479, // Latitude
      5000,
      10
    );
    expect(result).toHaveLength(2);
  });
});
