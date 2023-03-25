import {loadModelAndPredict} from './model.js';
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
