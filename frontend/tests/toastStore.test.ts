import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore, toast } from '../src/store/toastStore';

describe('Toast Notification Store', () => {
  beforeEach(() => {
    useToastStore.getState().clearAll();
    vi.useRealTimers();
  });

  it('initializes with an empty toast list', () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('adds a toast and assigns a unique id and timestamp', () => {
    const id = useToastStore.getState().addToast({
      type: 'success',
      title: 'Level Cleared',
      message: 'Great job matching candies!',
    });

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe(id);
    expect(state.toasts[0].type).toBe('success');
    expect(state.toasts[0].title).toBe('Level Cleared');
    expect(state.toasts[0].message).toBe('Great job matching candies!');
  });

  it('supports helper methods for all notification types', () => {
    toast.success('Success message', 'Success Title');
    toast.error('Error message', 'Error Title');
    toast.warning('Warning message', 'Warning Title');
    toast.info('Info message', 'Info Title');

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(4);
    // Newest toast is at index 0
    expect(state.toasts[0].type).toBe('info');
    expect(state.toasts[1].type).toBe('warning');
    expect(state.toasts[2].type).toBe('error');
    expect(state.toasts[3].type).toBe('success');
  });

  it('supports sweet custom candy toast with custom icon', () => {
    toast.sweet('Sugar Rush!', 'Sweet!', 3000, '🍬');

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].type).toBe('sweet');
    expect(state.toasts[0].icon).toBe('🍬');
    expect(state.toasts[0].title).toBe('Sweet!');
  });

  it('caps at maximum 4 active toasts on top-left to avoid screen overflow', () => {
    toast.info('Message 1');
    toast.info('Message 2');
    toast.info('Message 3');
    toast.info('Message 4');
    toast.info('Message 5');
    toast.info('Message 6');

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(4);
    expect(state.toasts[0].message).toBe('Message 6');
  });

  it('dismisses toast by id', () => {
    const id1 = toast.success('First');
    const id2 = toast.error('Second');

    expect(useToastStore.getState().toasts).toHaveLength(2);

    useToastStore.getState().dismissToast(id1);

    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(id2);
  });

  it('clears all active toasts', () => {
    toast.info('One');
    toast.info('Two');
    toast.info('Three');

    expect(useToastStore.getState().toasts).toHaveLength(3);
    useToastStore.getState().clearAll();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('auto-dismisses toasts after duration', () => {
    vi.useFakeTimers();

    toast.info('Temporary message', 'Auto-close', 500);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(501);
    expect(useToastStore.getState().toasts).toHaveLength(0);

    vi.useRealTimers();
  });
});
