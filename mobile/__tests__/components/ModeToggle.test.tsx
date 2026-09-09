import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ModeToggle } from '../../src/components/ModeToggle';

describe('ModeToggle', () => {
  it('highlights the selected mode and calls onChange', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<ModeToggle value="rent" onChange={onChange} />);

    expect(getByLabelText('Rent').props.accessibilityState.selected).toBe(true);
    fireEvent.press(getByLabelText('Buy'));
    expect(onChange).toHaveBeenCalledWith('buy');
  });
});
