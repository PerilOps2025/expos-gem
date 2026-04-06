const GAS_URL = "https://script.google.com/macros/s/AKfycbwzobE-fvX2cRfHY-eqVmpBYOFqbFZbaUGxSW8YdBWtKk-7zYU5Zza4cEpZ-iMi9ss_2A/exec";
const micBtn = document.getElementById('micBtn');
const statusText = document.getElementById('statusText');
const preview = document.getElementById('transcriptPreview');
const loader = document.getElementById('loader');

let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        statusText.innerText = "Step 1: [🔴 Recording...]"; // Phase 3 UI Requirement
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        statusText.innerText = "Step 2: [📝 Transcribing...]";
        preview.classList.remove('d-none');
        preview.innerText = transcript;
    };

    recognition.onend = async () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        if (preview.innerText) {
            await processWithGemini(preview.innerText);
        } else {
            statusText.innerText = "No speech detected. Tap to try again.";
        }
    };
}

micBtn.onclick = () => isRecording ? recognition.stop() : recognition.start();

async function processWithGemini(text) {
    statusText.innerText = "Step 3: [🤖 Sending to AI...]";
    loader.classList.remove('d-none');

    try {
        // Step 4: [⚙️ Parsing...] happens inside the GAS backend
        const response = await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors', // Architectural bypass for GAS
            body: JSON.stringify({
                action: 'PROCESS_TRANSCRIPT',
                payload: { transcript: text, source: 'voice-mobile' }
            })
        });

        statusText.innerHTML = "Step 5: <span class='text-success'>[✅ Items ready in Pending Room]</span>";
        setTimeout(() => {
            preview.classList.add('d-none');
            preview.innerText = "";
            loader.classList.add('d-none');
            statusText.innerText = "Tap to start recording";
        }, 4000);

    } catch (error) {
        statusText.innerText = "Error sending to ExPOS.";
        console.error(error);
    }
}
