describe('User Roles with Real Test Data', () => {
  it('should have correct roles for test users', async () => {
    // Get test admin user and their roles
    const adminUser = await prisma.user.findUnique({
      where: { email: 'test.admin@indii.music' },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    expect(adminUser).toBeTruthy();
    expect(adminUser.userRoles.some(ur => ur.role.name === 'admin')).toBe(true);

    // Get test artist user and their roles
    const artistUser = await prisma.user.findUnique({
      where: { email: 'test.artist@indii.music' },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    expect(artistUser).toBeTruthy();
    expect(artistUser.userRoles.some(ur => ur.role.name === 'artist')).toBe(true);

    // Get test listener user and their roles
    const listenerUser = await prisma.user.findUnique({
      where: { email: 'test.listener@indii.music' },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    expect(listenerUser).toBeTruthy();
    expect(listenerUser.userRoles.some(ur => ur.role.name === 'listener')).toBe(true);
  });

  it('should have correct profile data for users', async () => {
    // Test artist profile
    const artistProfile = await prisma.artistProfile.findFirst({
      where: {
        user: {
          email: 'test.artist@indii.music'
        }
      }
    });
    expect(artistProfile).toBeTruthy();
    expect(artistProfile.artistName).toBe('Test Artist');
    expect(artistProfile.genre).toBe('Electronic');

    // Test fan profile
    const fanProfile = await prisma.fanProfile.findFirst({
      where: {
        user: {
          email: 'test.listener@indii.music'
        }
      }
    });
    expect(fanProfile).toBeTruthy();
    expect(fanProfile.displayName).toBe('Test Listener');
    expect(fanProfile.favoriteGenres).toBe('Electronic, Pop');

    // Test service provider profiles
    const adminProfile = await prisma.serviceProviderProfile.findFirst({
      where: {
        user: {
          email: 'test.admin@indii.music'
        }
      }
    });
    expect(adminProfile).toBeTruthy();
    expect(adminProfile.companyName).toBe('Admin Services');
    expect(adminProfile.serviceType).toBe('admin');

    const producerProfile = await prisma.serviceProviderProfile.findFirst({
      where: {
        user: {
          email: 'test.producer@indii.music'
        }
      }
    });
    expect(producerProfile).toBeTruthy();
    expect(producerProfile.companyName).toBe('Producer Services');
    expect(producerProfile.serviceType).toBe('producer');
  });

  it('should have security logs for all users', async () => {
    const logs = await prisma.securityLog.findMany({
      include: {
        user: true
      }
    });

    // Should have one log per user
    expect(logs).toHaveLength(4);

    // Each user should have an account_created log
    const emails = ['test.admin@indii.music', 'test.artist@indii.music', 
                   'test.producer@indii.music', 'test.listener@indii.music'];
    
    for (const email of emails) {
      const log = logs.find(l => l.user.email === email);
      expect(log).toBeTruthy();
      expect(log.action).toBe('account_created');
      expect(log.details).toHaveProperty('email', email);
    }
  });
});
