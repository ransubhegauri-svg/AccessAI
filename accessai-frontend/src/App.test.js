import { render, screen } from '@testing-library/react';
import App, { getPersistedRoute, saveCurrentRoute } from './App';

beforeEach(() => {
  window.localStorage.clear();
});

test('renders AccessAI app', async () => {
  render(<App />);
  const selectModeBtn = await screen.findByText(/Select Mode/i);
  expect(selectModeBtn).toBeInTheDocument();
});

test('persists and restores the last route', () => {
  saveCurrentRoute('/blind');
  expect(getPersistedRoute()).toBe('/blind');

  saveCurrentRoute('/motor/settings');
  expect(getPersistedRoute()).toBe('/motor/settings');
});
