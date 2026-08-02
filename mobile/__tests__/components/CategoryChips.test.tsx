import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryChips } from '../../src/components/CategoryChips';

describe('CategoryChips', () => {
  it('highlights the selected category and calls onSelect', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(<CategoryChips selected="all" onSelect={onSelect} />);

    expect(getByLabelText('All gear').props.accessibilityState.selected).toBe(true);
    fireEvent.press(getByLabelText('Camping'));
    expect(onSelect).toHaveBeenCalledWith('camping');
  });
});
