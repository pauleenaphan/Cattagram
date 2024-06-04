//handles input imgs
export const handleImageUpload = (e, callback) => {
    const file = e.target.files[0]; // Get the selected file

    // Create a new FileReader instance
    const reader = new FileReader();

    // Set up FileReader onload callback function
    reader.onload = (event) => {
        // Compress the image before uploading
        compressImage(event.target.result, callback);
    };
    // Read the selected file as a data URL
    reader.readAsDataURL(file);
};

//resize the imgs
const compressImage = (dataUrl, callback) => {
    const imageElement = new Image();
    imageElement.src = dataUrl;

    // Set up image onload callback function
    imageElement.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 500; // Target size for both width and height

        // Set canvas dimensions
        canvas.width = size;
        canvas.height = size;

        // Calculate cropping dimensions
        let cropX = 0;
        let cropY = 0;
        let width = imageElement.width;
        let height = imageElement.height;

        // Calculate dimensions for square cropping
        if (width > height) {
            // Landscape orientation
            cropX = (width - height) / 2;
            width = height;
        } else if (height > width) {
            // Portrait orientation
            cropY = (height - width) / 2;
            height = width;
        }

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageElement, cropX, cropY, width, height, 0, 0, size, size);

        // Convert canvas to data URL with JPEG format and quality 1
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 1);

        // Call the provided callback with the compressed image
        callback(compressedDataUrl);
    };
};

//returns date in format
export const getDate = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; 
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    return `${month}/${day}/${year}`;
};

//notification popups
export const setAlert = (msg, setAlertMsg, setAlertPopup) =>{
    setAlertMsg(msg);
    setAlertPopup(true);

    setTimeout(() => {
        setAlertPopup(false);
    }, 3000); 
}
