import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';

/*
* SelectForm Component
* A reusable select/dropdown form component using MUI's Select.
*
* Props:
* - id: string - The id of the select field.
* - label: string - The label for the select field.
* - options: array - An array of option objects with 'id' and 'name' properties.
* - name: string - The name attribute for the select field.
* - onChange: function - Handler for change events.
* - onBlur: function - Handler for blur events.
* - value: any - The current value of the select field.
* - error: boolean - Whether to display an error state.
* - helpTxt: string - Helper text to display below the select field.
* - variant: string - The variant of the FormControl ('standard', 'outlined', etc.).
*/

export default function SelectForm(props) {
    const { id, 
            label, 
            options, 
            name, 
            onChange, 
            onBlur, 
            value,
            error,
            helpTxt,
            variant = 'standard' } = props;

    return (
        <div>
        <FormControl 
         variant={variant}
         sx={{ m: 0, minWidth: 120, paddingBottom: 0, width: '100%' }}
         error={error}>
            <InputLabel id="demo-simple-select-standard-label">
                {label}
            </InputLabel>
            <Select
            labelId="demo-simple-select-standard-label"
            id={id}
            label={variant === 'outlined' ? label : undefined}
            value={value}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            >
            {options && options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                    {option.name}
                </MenuItem>
            ))}
            </Select>
            {helpTxt && <FormHelperText>{helpTxt}</FormHelperText>}
        </FormControl>
        </div>
    );
}
