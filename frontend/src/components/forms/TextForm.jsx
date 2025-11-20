import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/Visibility';

/*
* TextForm Component
* A reusable text input form component using MUI's TextField.
*
* Props:
* - id: string - The id of the text field.
* - label: string - The label for the text field.
* - value: string - The current value of the text field.
* - name: string - The name attribute for the text field.
* - onChange: function - Handler for change events.
* - onBlur: function - Handler for blur events.
* - error: boolean - Whether to display an error state.
* - helpTxt: string - Helper text to display below the text field.
* - type: string - The type of the input (e.g., 'text', 'password').
*/

export default function TextForm(props) {
    const { 
        id, 
        label, 
        value, 
        name, 
        onChange, 
        onBlur, 
        error, 
        helpTxt, 
        type = 'text' // default
    } = props;

    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    
    const inputType = type === 'password' ? 
                               (showPassword ? 'text' : 'password') : type;

    return (
        <TextField 
            id={id} 
            label={label} 
            sx={{ width: '100%' }}
            value={value}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            helperText={helpTxt}
            type={inputType}
            InputProps={
                type === 'password' ? {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? 
                                <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                } : undefined
            }
        />
    );
}