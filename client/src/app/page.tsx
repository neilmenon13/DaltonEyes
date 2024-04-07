'use client'

import React, { ChangeEvent, useState } from 'react'
import { files } from './components/ImageLoader'
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { useRouter } from 'next/navigation';

function Page({ params }: { params: any }) {
    console.log(files)

    const [fileName, setFileName] = useState('No file uploaded');
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [fileInput, setFileInput] = useState<File | null>(null)

    const router = useRouter();

    const [colorBlind, setColorBlind] = useState('')

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
         if(file) {
            setFileName('Upload Successful!')
            setFileInput(file)
         }
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = (error) => {
            reject(error);
          };
          reader.readAsDataURL(file);
        });
      };

    const handleChange = (event: SelectChangeEvent) => {
        setColorBlind(event.target.value as string);
    };

    const handleClick = async () => {
        // const convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
        //     return new Promise((resolve, reject) => {
        //         const reader = new FileReader();
        //         reader.onerror = reject;
        //         reader.onload = () => {
        //             resolve(reader.result);
        //         };
        //         reader.readAsDataURL(blob);
        //     });
        // };
         
        // if(imageSrc) {
        //     fetch(imageSrc)
        //         .then(res => res.blob())
        //         .then(res => convertBlobToBase64(res)
        //         .then(base64data => {
        //         fetch('http://127.0.0.1:5000/process-image', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //             },
        //             body: JSON.stringify({ image: base64data }),
        //         });
        //         }).catch(error => console.error("Blob conversion error", error))
        //     )
            
            
        // }
        if(fileInput) {
            const base64File = await fileToBase64(fileInput);

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
              "image": base64File,
              "condition": colorBlind
            });
            
            const requestOptions: RequestInit = {
              method: "POST",
              headers: myHeaders,
              body: raw,
              redirect: "follow"
            };
            
            fetch("http://127.0.0.1:4000/", requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    setImageSrc(result.image)
                })
                .catch((error) => console.error(error));
        }
        
    } 

    return (
        <div className='flex flex-row w-screen h-screen'>
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
                        <MenuItem value="protanopia">Protanopia</MenuItem>
                        <MenuItem value="deuteranopia">Deuteranopia</MenuItem>
                        <MenuItem value="tritanopia">Tritanopia</MenuItem>
                    </Select>
                    <Button className="hidden w-0 h-0" variant='contained'></Button>
                    <Button variant='contained' size="large" className="w-[10rem] mt-10" onClick={handleClick}>Convert</Button>
                </FormControl>
            </Box>
            <Box className="flex h-screen items-center m-auto">
                {imageSrc ? <img src={imageSrc} /> : <p>Waiting...</p>}
            </Box>
        </div>
    )
}

export default Page