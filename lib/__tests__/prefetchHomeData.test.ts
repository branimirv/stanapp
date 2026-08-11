import { HOME_PREFETCH_MAX_MS, prefetchHomeDataBounded } from '@/lib/prefetchHomeData';

jest.mock('@/lib/queryClient', () => ({
  queryClient: {
    prefetchQuery: jest.fn(),
  },
}));

jest.mock('@/services/dashboard', () => ({
  fetchDashboardStats: jest.fn(),
}));

jest.mock('@/services/profile', () => ({
  fetchProfile: jest.fn(),
}));

jest.mock('@/services/properties', () => ({
  fetchProperties: jest.fn(),
}));

describe('prefetchHomeDataBounded', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('settles when underlying prefetch resolves', async () => {
    const { queryClient } = jest.requireMock('@/lib/queryClient') as {
      queryClient: { prefetchQuery: jest.Mock };
    };
    queryClient.prefetchQuery.mockResolvedValue(undefined);

    const done = prefetchHomeDataBounded('user-1');
    await Promise.resolve();
    await expect(done).resolves.toBeUndefined();
  });

  it('settles on the max timeout when prefetch hangs', async () => {
    const { queryClient } = jest.requireMock('@/lib/queryClient') as {
      queryClient: { prefetchQuery: jest.Mock };
    };
    queryClient.prefetchQuery.mockImplementation(() => new Promise(() => {}));

    const done = prefetchHomeDataBounded('user-1', HOME_PREFETCH_MAX_MS);
    jest.advanceTimersByTime(HOME_PREFETCH_MAX_MS);
    await expect(done).resolves.toBeUndefined();
  });

  it('settles when prefetch rejects', async () => {
    const { queryClient } = jest.requireMock('@/lib/queryClient') as {
      queryClient: { prefetchQuery: jest.Mock };
    };
    queryClient.prefetchQuery.mockRejectedValue(new Error('network'));

    await expect(prefetchHomeDataBounded('user-1')).resolves.toBeUndefined();
  });
});
