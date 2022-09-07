// Size of the image expected.
const IMAGE_WIDTH = 80;
const IMAGE_HEIGHT = 30;

window.onload = function(){
    console.log("page load!");
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = function(e) {
        console.warn(`Could not load image from external source ${src}.`);
    };
    img.onload = function(e) {
        img.width = IMAGE_WIDTH;
        img.height = IMAGE_HEIGHT;
        // When image is loaded, render it to a canvas and send its ImageData back to the service worker.
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        let message = {
            action: 'PREDICT_IMAGE',
            rawImageData: Array.from(imageData.data),
            width: img.width,
            height: img.height,
            // url: document.getElementsByName("passwd2")[0].nextSibling.nextSibling.src
        }
        chrome.runtime.sendMessage(message, response => {
            document.getElementsByName("passwd2")[0].value = response.prediction;
        });
    };
    img.src = document.getElementsByName("passwd2")[0].nextSibling.nextSibling.src;
}