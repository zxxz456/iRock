import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';

/*
This component renders a multi-select dropdown form using Material-UI.

Props:
- id: string - The id of the select component.
- label: string - The label for the select component.
- options: array - An array of option objects with 'id' and 'name' properties.
- value: array - An array of selected option ids.
- name: string - The name attribute for the select component.
- onChange: function - Handler for change events.
- onBlur: function - Handler for blur events.
- error: boolean - Whether to display an error state.
- helpTxt: string - Helper text to display below the select component.
*/

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function MultiSelectForm(props) {
    const theme = useTheme();
    const { id, 
            label, 
            options, 
            value, 
            name, 
            onChange, 
            onBlur,
            error,
            helpTxt } = props;

    return (
        <div>
        <FormControl sx={{ m: 0, width: '100%' }}>
            <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
            <Select
            labelId="demo-multiple-chip-label"
            id={id}
            multiple
            value={value}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            helptext={helpTxt}
            input={<OutlinedInput id="select-multiple-chip" label={label} />}
            renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                    <Chip key={value} 
                    label={options.find(option => option.id===value)?.name} />
                ))}
                </Box>
            )}
            MenuProps={MenuProps}
            >
            {options.map((option) => (
                <MenuItem
                key={option.id}
                value={option.id}
                >
                {option.name}
                </MenuItem>
            ))}
            </Select>
            {helpTxt && <FormHelperText error={error}>{helpTxt}</FormHelperText>}
        </FormControl>
        </div>
    );
}
