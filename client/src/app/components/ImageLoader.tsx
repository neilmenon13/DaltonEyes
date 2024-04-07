'use client'
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material'
import { useRouter } from 'next/navigation';
import React, { useState, ChangeEvent } from 'react'

let files: File | null

function ImageLoader() {
    const [fileName, setFileName] = useState('No file uploaded');
    const [file, setFile] = useState<File | null>(null)

    const router = useRouter();

    const [colorBlind, setColorBlind] = useState('')

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // Get the first file's name
            const file = event.target.files ? event.target.files[0] : null;
            setFile(file)
            setFileName('Upload Successful!'); // Update the state with the file name
            files = file
        }
    }

    const handleChange = (event: SelectChangeEvent) => {
        setColorBlind(event.target.value as string);
    };

    return (
        <Box className='flex h-screen w-5/12 flex-col pl-10 pt-11 border-r-2'>
            <h1 className="mb-14 text-6xl">DaltonEyes</h1>
            <div className='flex text-center w-fit'>
                <input id='image_upload' type="file" className='' style={{ display: 'none', width: '0px', height: '0px'}} onChange={handleFileChange} />
                    <label htmlFor='image_upload' className='w-[160px] tonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButton-colorPrimary css-sghohy-MuiButtonBase-root-MuiButton-root mb-1'>
                        Upload Image
                    </label>
                <p className='my-auto ml-3'>{fileName}</p>
            </div>
            <Divider className='w-[300px] my-6'/>
            <FormControl className='flex h-max'>
                <InputLabel id="colorblind">Type of color blindness</InputLabel>
                <Select
                    labelId='colorblind'
                    id='colorblindSelect'
                    label='Type of color blindness'
                    value={colorBlind}
                    className="max-w-64"
                    autoWidth
                    onChange={handleChange}
                >
                    <MenuItem value="Protanopia">Protanopia</MenuItem>
                    <MenuItem value="Dutranopia">Dutranopia</MenuItem>
                    <MenuItem value="Tritanopia">Tritanopia</MenuItem>
                </Select>
                <Button className="hidden w-0 h-0" variant='contained'></Button>
                <Button variant='contained' size="large" className="w-[10rem] mt-10" onClick={() => router.push(`/images/${file}/${colorBlind}`)}>Convert</Button>
            </FormControl>
        </Box>
    )
}

export default ImageLoader
export { files }