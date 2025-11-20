import * as React from 'react';
import TextField from '@mui/material/TextField';

/*
* MultilineTextForm Component
* A reusable multiline text input form component using MUI's TextField.
*
* Props:
* - id: string - The id of the text field.
* - label: string - The label for the text field.
* - rows: number - The number of rows for the multiline text field.
* - placeholder: string - Placeholder text for the text field.
* - value: string - The current value of the text field.
* - onChange: function - Handler for change events.
* - onBlur: function - Handler for blur events.
* - name: string - The name attribute for the text field.
* - error: boolean - Whether to display an error state.
* - helpTxt: string - Helper text to display below the text field.
*/

export default function MultilineTextForm(props) {
    const { id, label, rows, placeholder, 
            value, onChange, onBlur, name,
            error, helpTxt } = props;
    return (
        <TextField
        id={id}
        label={label}
        placeholder={placeholder}
        multiline
        rows={rows}
        value={value}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        helperText={helpTxt}
        variant="standard"
        sx={{ width: '100%' }}
        />
  );
}
