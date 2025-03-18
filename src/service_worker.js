import * as tf from '@tensorflow/tfjs';

// Size of the image expected.
const IMAGE_WIDTH = 104;
const IMAGE_HEIGHT = 32;

const FIVE_SECONDS_IN_MS = 5000;


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (!message)
        return;
    switch (message.action) {
        case 'PREDICT_IMAGE':
            const imageData = new ImageData(Uint8ClampedArray.from(message.rawImageData), message.width, message.height);
            imageClassifier.analyzeImage(imageData).then(prediction => sendResponse({prediction: prediction}))
            return true;
        default:
            break;
    }

});

class ImageClassifier {
    constructor() {
        this.loadModel();
    }

    async loadModel() {
        console.log('Loading model...');
        const startTime = performance.now();
        try {
            this.model = await tf.loadLayersModel(chrome.runtime.getURL('/src/model/model.json'));
            // Warms up the model by causing intermediate tensor values
            // to be built and pushed to GPU.
            tf.tidy(() => {
                this.model.predict(tf.zeros([1, IMAGE_HEIGHT, IMAGE_WIDTH, 3]));
            });
            const totalTime = Math.floor(performance.now() - startTime);
            console.log(`Model loaded and initialized in ${totalTime} ms...`);
        } catch (e) {
            console.error('Unable to load model', e);
        }
    }

    /**
     * Triggers the model to make a prediction on the image referenced by the
     * image data. After a successful prediction, return result of the prediction.
     *
     * @param {ImageData} imageData Image of the image to analyze.
     */
    async analyzeImage(imageData) {
        if (!this.model) {
            console.log('Waiting for model to load...');
            setTimeout(
                () => {this.analyzeImage(imageData)}, FIVE_SECONDS_IN_MS);
            return;
        }
        const data = tf.browser.fromPixels(imageData).cast('float32').div(255).expandDims(0);
        const startTime = performance.now();
        const predictions = await this.model.predict(data);
        const prediction = predictions.map((prediction)=>(prediction.as1D().argMax().dataSync())).join("")
        const totalTime = performance.now() - startTime;
        console.log(`Done in ${totalTime.toFixed(1)} ms`);
        return prediction;
    }
}

const imageClassifier = new ImageClassifier();

chrome.webNavigation.onBeforeNavigate.addListener(function(){},{
    urls: [{ urlPrefix: 'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/' }]
});
