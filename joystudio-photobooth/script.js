const video = document.getElementById("video");
const countdownEl = document.getElementById("countdown");
const counterEl = document.getElementById("counter");
const shutterOverlay = document.createElement("div");
shutterOverlay.style.position = "absolute";
shutterOverlay.style.top = "0";
shutterOverlay.style.left = "0";
shutterOverlay.style.width = "100%";
shutterOverlay.style.height = "100%";
shutterOverlay.style.background = "white";
shutterOverlay.style.opacity = "0";
shutterOverlay.style.transition = "opacity 0.2s ease-out";
document.body.appendChild(shutterOverlay);

const shutterSound = new Audio("shutter.mp3");
const countdownSound = new Audio("countdown.mp3");

const capturedPhotos = [];
let capturedCount = 0;

// Adjust constraints for mobile
const isMobile = window.innerWidth <= 600;
const videoConstraints = {
    video: {
        facingMode: "user", // Use front camera on mobile
        width: isMobile ? { ideal: 480 } : { ideal: 640 },
        height: isMobile ? { ideal: 640 } : { ideal: 480 }
    }
};

// Fix for mobile Chrome black screen issue
video.setAttribute("playsinline", true);
video.setAttribute("autoplay", true);
video.setAttribute("muted", true);

// Start webcam
navigator.mediaDevices.getUserMedia(videoConstraints)
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => console.error("Camera access denied", err));

// Create manual capture button
const manualCaptureBtn = document.createElement("button");
manualCaptureBtn.textContent = "Capture Photo";
manualCaptureBtn.style.position = "absolute";
manualCaptureBtn.style.bottom = "70px"; // Adjust this value as needed
manualCaptureBtn.style.left = "50%";
manualCaptureBtn.style.transform = "translateX(-50%)";
manualCaptureBtn.style.padding = "10px 20px";
manualCaptureBtn.style.fontSize = "16px";
document.body.appendChild(manualCaptureBtn);

// Create next button (initially hidden)
const nextBtn = document.createElement("button");
nextBtn.textContent = "Next";
nextBtn.style.position = "absolute";
nextBtn.style.bottom = "70px"; // Adjust this value as needed
nextBtn.style.left = "50%";
nextBtn.style.transform = "translateX(-50%)";
nextBtn.style.padding = "10px 20px";
nextBtn.style.fontSize = "16px";
nextBtn.style.display = "none"; // Hide initially
document.body.appendChild(nextBtn);

// Event listener for manual capture button
manualCaptureBtn.addEventListener("click", () => {
    if (capturedCount < 4) {
        manualCaptureBtn.disabled = true; // Disable the button
        capturePhotoWithCountdown();
    }
});

// Event listener for next button
nextBtn.addEventListener("click", () => {
    redirectToDownload();
});

// Countdown and capture photo
function capturePhotoWithCountdown() {
    if (capturedCount >= 4) {
        redirectToDownload();
        return;
    }

    let timeLeft = 5;   
    countdownEl.textContent = timeLeft;
    counterEl.textContent = `${capturedCount}/4`;
    countdownSound.play();
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;
        countdownSound.play();

        if (timeLeft === 1) {
            triggerShutterAnimation();
        }

        if (timeLeft <= 1) {
            clearInterval(countdownInterval);
            capturePhoto();
        }
    }, 1000);
}

// Capture photo
function capturePhoto() {
    const canvas = document.createElement("canvas");
    canvas.width = isMobile ? 480 : 640;
    canvas.height = isMobile ? 640 : 480;
    const ctx = canvas.getContext("2d");

    // Flip canvas horizontally for front camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedPhotos.push(canvas.toDataURL("image/png"));
    capturedCount++;
    counterEl.textContent = `${capturedCount}/4`;

    if (capturedCount >= 4) {
        manualCaptureBtn.style.display = "none";
        nextBtn.style.display = "block";
    } else {
        manualCaptureBtn.disabled = false; // Re-enable the button
    }
}

// Shutter animation
function triggerShutterAnimation() {
    shutterOverlay.style.opacity = "1";
    shutterSound.play();
    setTimeout(() => {
        shutterOverlay.style.opacity = "0";
    }, 100);
}

// Redirect to download page with captured images
function redirectToDownload() {
    sessionStorage.setItem("capturedPhotos", JSON.stringify(capturedPhotos));
    window.location.href = "download.html";
}
