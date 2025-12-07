import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Onboarding from './Onboarding';

// Mock Lucide icons to avoid issues
vi.mock('lucide-react', () => ({
  ChevronRight: () => <div data-testid="icon-chevron-right" />,
  ChevronLeft: () => <div data-testid="icon-chevron-left" />,
  Check: () => <div data-testid="icon-check" />,
  Globe: () => <div data-testid="icon-globe" />,
  FileText: () => <div data-testid="icon-file-text" />,
  Code: () => <div data-testid="icon-code" />,
  CheckCircle: () => <div data-testid="icon-check-circle" />,
  Copy: () => <div data-testid="icon-copy" />,
}));

// Mock DropZone
vi.mock('./DropZone', () => ({
  default: ({ onFilesAdded }: any) => (
    <div data-testid="dropzone">
      <button onClick={() => onFilesAdded([])}>Add Files</button>
    </div>
  ),
}));

describe('Onboarding Component', () => {
  const mockOnComplete = vi.fn();
  const mockOnConfigChange = vi.fn();
  const mockOnAddKnowledge = vi.fn();
  const mockOnUpdateKnowledge = vi.fn();
  const mockOnCompanyInfoChange = vi.fn();

  const defaultProps = {
    onComplete: mockOnComplete,
    config: {
      name: 'Test Bot',
      tone: 'professional' as const,
      primaryColor: '#000000',
      quickQuestions: ['Q1', 'Q2'],
    },
    onConfigChange: mockOnConfigChange,
    knowledge: [],
    onAddKnowledge: mockOnAddKnowledge,
    onUpdateKnowledge: mockOnUpdateKnowledge,
    companyInfo: {
      name: 'Test Co',
      website: 'https://example.com',
      industry: 'tech',
      email: 'test@example.com',
    },
    onCompanyInfoChange: mockOnCompanyInfoChange,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('shows progress bar during crawling', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ title: 'Example', content: 'Content' }),
    });

    render(<Onboarding {...defaultProps} />);

    // Navigate to step 2
    fireEvent.click(screen.getByText('Next Step'));
    
    // Check if we are on step 2
    expect(screen.getByText('Add your knowledge')).toBeInTheDocument();

    // Input URL (if empty)
    const input = screen.getByPlaceholderText('https://example.com');
    fireEvent.change(input, { target: { value: 'https://test.com' } });

    // Click Import
    const importButton = screen.getByText('Import');
    fireEvent.click(importButton);

    // Expect loading state
    expect(screen.getByText(/Scanning website content/i)).toBeInTheDocument();
    
    // Check for progress percentage (starts at 0)
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Advance time to simulate progress
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText('10%')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Should be capped at 90% until fetch resolves
    // (4 more ticks: 30, 50, 70, 90) - Wait, logic adds 10 every 500ms.
    // 500ms -> 10%
    // 2500ms -> 50%
    // Let's advance more
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Now resolve fetch
    await waitFor(() => {
      expect(mockOnUpdateKnowledge).toHaveBeenCalled();
    });

    // Should finish
    // Note: The component logic clears interval and sets to 100 on success
  });

  it('handles crawl error gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<Onboarding {...defaultProps} />);

    // Navigate to step 2
    fireEvent.click(screen.getByText('Next Step'));
    
    const input = screen.getByPlaceholderText('https://example.com');
    fireEvent.change(input, { target: { value: 'https://fail.com' } });

    fireEvent.click(screen.getByText('Import'));

    // Advance time
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('20%')).toBeInTheDocument();

    // Wait for failure
    await waitFor(() => {
      expect(mockOnUpdateKnowledge).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ status: 'error' }));
    });
    
    // Progress bar should eventually disappear
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });
});

