import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header', () => {
  render(<App />);
  const mapElement = screen.getByText('UltraSearch');
  expect(mapElement).toBeInTheDocument();
});

test('renders table', async () => {
  render(<App />);
  const tableElement = await screen.getByText('Name');
  expect(tableElement).toBeInTheDocument();
});
