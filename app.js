const GAS_URL = "https://script.google.com/macros/s/AKfycbwzobE-fvX2cRfHY-eqVmpBYOFqbFZbaUGxSW8YdBWtKk-7zYU5Zza4cEpZ-iMi9ss_2A/exec";
const micBtn = document.getElementById('micBtn');
const statusText = document.getElementById('status');
const preview = document.getElementById('transcriptPreview');

let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        statusText.innerText = "Listening...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        preview.classList.remove('d-none');
        preview.innerText = transcript;
    };

    recognition.onend = () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        statusText.innerText = "Processing with Gemini...";
        sendToExPOS(preview.innerText);
    };

    recognition.onerror = (err) => {
        statusText.innerText = "Error: " + err.error;
        micBtn.classList.remove('recording');
    };
}

micBtn.onclick = () => {
    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
};

async function sendToExPOS(text) {
    if (!text) return;

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors', // The "Simple Request" hack
            body: JSON.stringify({
                action: 'PROCESS_TRANSCRIPT',
                payload: { transcript: text, source: 'voice-mobile' }
            })
        });

        statusText.innerText = "Sent! Check your INBOX sheet.";
        setTimeout(() => { 
            statusText.innerText = "Tap to start recording";
            preview.classList.add('d-none');
        }, 3000);

    } catch (error) {
        statusText.innerText = "Upload failed. Check console.";
        console.error(error);
    }
}
