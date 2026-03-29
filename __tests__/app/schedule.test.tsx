import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import MyScheduleScreen from '../../app/more/schedule';
import { ThemeProvider } from '../../lib/ThemeContext';
import { Job } from '../../lib/types';
import { api } from '../../services/api';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApiGet = api.get as jest.Mock;

const dateKey = (d: Date) => d.toISOString().slice(0, 10);

const today = new Date();
today.setHours(0, 0, 0, 0);

const todayKey = dateKey(today);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const tomorrowKey = dateKey(tomorrow);

const makeJob = (id: number, jobDate: string): Job => ({
  id,
  job_number: `SCH-${id}`,
  project: `Schedule Project ${id}`,
  job_date: jobDate,
  shift_start: '07:00',
  material: 'Aggregate',
  job_foreman_name: 'Taylor Foreman',
  job_foreman_contact: '555-0111',
  additional_notes: 'Schedule test fixture',
  loading_address: 100,
  unloading_address: 200,
  loading_address_info: {
    id: 100,
    street_address: '100 Riverfront Dr',
    city: 'Mankato',
    state: 'MN',
    zip_code: '56001',
    country: 'USA',
    location_name: 'Mankato Yard',
    location_type: 'yard',
    latitude: '44.1636',
    longitude: '-93.9994',
  },
  unloading_address_info: {
    id: 200,
    street_address: '20 Madison Ave',
    city: 'North Mankato',
    state: 'MN',
    zip_code: '56003',
    country: 'USA',
    location_name: 'River Bend Site',
    location_type: 'jobsite',
    latitude: '44.1733',
    longitude: '-94.0338',
  },
  backhaul_loading_address_info: null,
  backhaul_unloading_address_info: null,
  is_backhaul_enabled: false,
  driver_assignments: [],
});

function renderScreen() {
  return render(
    <ThemeProvider>
      <MyScheduleScreen />
    </ThemeProvider>
  );
}

describe('MyScheduleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner on mount', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {}));

    const { UNSAFE_getByType } = renderScreen();

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders jobs for selected day when API returns data', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [makeJob(1, todayKey), makeJob(2, tomorrowKey)] });

    const { getByText, queryByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('SCH-1')).toBeTruthy();
      expect(getByText('Schedule Project 1')).toBeTruthy();
      expect(getByText('07:00 · Aggregate')).toBeTruthy();
      expect(getByText('Mankato')).toBeTruthy();
      expect(queryByText('SCH-2')).toBeNull();
    });
  });

  it('renders empty state when no jobs match selected day', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [makeJob(2, tomorrowKey)] });

    const { getByText, queryByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('No jobs on this day')).toBeTruthy();
      expect(queryByText('SCH-2')).toBeNull();
    });
  });

  it('shows error state on network failure', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Schedule API unavailable'));

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('Schedule API unavailable')).toBeTruthy();
      expect(getByText('Tap to retry')).toBeTruthy();
    });
  });

  it('pull-to-refresh calls fetch again', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [makeJob(1, todayKey)] });
    mockApiGet.mockResolvedValueOnce({ data: [makeJob(1, todayKey)] });

    const { UNSAFE_getByType } = renderScreen();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(1);
      expect(mockApiGet).toHaveBeenNthCalledWith(1, '/drivers/me/jobs/', { params: { upcoming: true } });
    });

    const list = UNSAFE_getByType(FlatList);

    await act(async () => {
      await list.props.refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledTimes(2);
      expect(mockApiGet).toHaveBeenNthCalledWith(2, '/drivers/me/jobs/', { params: { upcoming: true } });
    });
  });

  it('navigates to job detail when a schedule card is pressed', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [makeJob(44, todayKey)] });

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(getByText('SCH-44')).toBeTruthy();
    });

    fireEvent.press(getByText('SCH-44'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/job/[id]',
      params: { id: 44 },
    });
  });
});