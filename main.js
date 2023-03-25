const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const border = document.getElementById("border");
const toggleKeypointsButton = document.getElementById("toggleKeypointsButton");
const video = document.getElementById("video");
const canvas = document.getElementById("videoCanvas");
const ctx = canvas.getContext("2d");
const keypointsCanvas = document.getElementById("keypointsCanvas");
const keypointsCtx = keypointsCanvas.getContext("2d");

let isCameraOn = false;
let showKeypoints = true;
var delay = 2000;

const textOutput = document.getElementById("textOutput");
let arr = [null, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '0'];


async function loadModelAndPredict(inputData) { 
    // Replace the path with the actual path to your model.json file 
    const modelUrl = "./model.json";

    // Load the model 
    const model = await tf.loadLayersModel(modelUrl);
    
    // Prepare the input data 
    // inputData should be an array or a tensor with the shape your model expects 
    const input = tf.tensor(inputData);
    
    // Make a prediction using the model 
    const prediction = model.predict(input);
    
    
    // Log the prediction to the console 

    // keypointsElement.textContent = arr[prediction];
    const predictionArray = await prediction.array();
    
    // Log the prediction to the console 
    for(var i = 0; i < predictionArray.length(); i++) {
        console.log("Prediction:", predictionArray[i]);
    }
    
    // Don't forget to dispose the tensors to avoid memory leaks 
    input.dispose(); 
    prediction.dispose(); 
}

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function detectHands() {
  const model = await handpose.load();
  video.play();

  function drawVideo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, video.width, video.height);

    if (isCameraOn) {
      requestAnimationFrame(drawVideo);
    }
  }

  drawVideo();

  async function detect() {
    const predictions = await model.estimateHands(video);
    keypointsCtx.clearRect(0, 0, keypointsCanvas.width, keypointsCanvas.height);
  
    const keypointsOutput = document.getElementById("keypointsOutput");
    keypointsOutput.innerHTML = ""; // Clear previous keypoints
  
    for (let i = 0; i < predictions.length; i++) {
      const keypoints = predictions[i].landmarks;
      let normalizedKeypoints = [];
  
      // Normalize keypoints and create a 1D array
      for (let j = 0; j < keypoints.length; j++) {
        const normalizedX = keypoints[j][0] / video.width;
        const normalizedY = keypoints[j][1] / video.height;
        normalizedKeypoints.push(normalizedX, normalizedY);
      }
  
      const keypointsText = `Hand ${i + 1}: ${JSON.stringify(normalizedKeypoints)}`;
      const keypointsElement = document.createElement("pre");
      keypointsElement.textContent = keypointsText;
      keypointsOutput.appendChild(keypointsElement);
  
      // Draw dots at each keypoint
      for (let j = 0; j < keypoints.length; j++) {
        keypointsCtx.beginPath();
        keypointsCtx.arc(keypoints[j][0], keypoints[j][1], 5, 0, 2 * Math.PI);
        keypointsCtx.fillStyle = "red";
        keypointsCtx.fill();
      }

    }
    
    loadModelAndPredict(keypointsOutput);

    if (isCameraOn) {
      // Call the detect function again after a delay for keypoint detection
      setTimeout(() => {
        detect();
      }, delay);
    }
  }
  
  // Rest of the code remains the same
  

  detect();
}


function setDelay(x) {
  delay = x;
  console.log(delay);
}

async function main() {
  await setupCamera();

  startButton.addEventListener("click", () => {
    isCameraOn = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    border.style.display = "block";
    video.style.display = "none";
    canvas.style.display = "block";
    keypointsCanvas.style.display = "block";
    detectHands();
  });

  stopButton.addEventListener("click", () => {
    isCameraOn = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    border.style.display = "none";
    video.style.display = "none";
    canvas.style.display = "none";
    keypointsCanvas.style.display = "none";
  });

  toggleKeypointsButton.addEventListener("click", () => {
    showKeypoints = !showKeypoints;
    toggleKeypointsButton.textContent = showKeypoints
      ? "Hide Keypoints"
      : "Show Keypoints";
  });
}

main();
