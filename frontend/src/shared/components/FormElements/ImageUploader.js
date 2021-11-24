import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';

import './ImageUploader.css';

const ImageUploader = (props) => {
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const [isValid, setIsValid] = useState();

    const filePicker = useRef();

    useEffect(() => {
        if (!file) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = () => {
            setPreviewUrl(fileReader.result);
        };
        fileReader.readAsDataURL(file);
    }, [file]);

    const pickImageHAndler = () => {
        filePicker.current.click();
    };

    const pickedHandler = (event) => {
        const files = event.target.files;
        let fileIsValid = isValid;
        let pickedFile;

        if ((files && files.length === 1) || file) {
            pickedFile = files[0] || file;
            setFile(pickedFile);
            setIsValid(true);
            fileIsValid = true;
        } else {
            setIsValid(false);
            fileIsValid = false;
        }

        props.onInput(props.id, pickedFile, fileIsValid);
    };

    return (
        <div className="form-control">
            <input
                id={props.id}
                style={{ display: 'none' }}
                type="file"
                accept=".jpg, .png, .jpeg"
                ref={filePicker}
                onChange={pickedHandler}
            />
            <div className={`image-upload ${props.center && 'center'}`}>
                <div className={`image-upload__preview _clickable`} onClick={pickImageHAndler}>
                    {previewUrl && <img src={previewUrl} alt="Preview" />}
                    {!previewUrl && <p>Please pick an image.</p>}
                </div>
                <Button type="button" onClick={pickImageHAndler}>PICK IMAGE</Button>
            </div>
            {!isValid && <p>{props.errorText}</p>}
        </div>
    );
};

export default ImageUploader;