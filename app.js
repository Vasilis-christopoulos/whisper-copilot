const API_URL = 'https://8abneslr0c.execute-api.us-east-1.amazonaws.com/prod/invoke';
const OPENAI_API_KEY = prompt('Enter your OpenAI API Key:') || '';
let sessionId = generateSessionId();
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

function generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

async function searchProducts() {
    const inputText = document.getElementById('inputText').value.trim();
    const loadingDiv = document.getElementById('loading');
    const searchBtn = document.getElementById('searchBtn');

    if (!inputText) {
        alert('Please enter a search query');
        return;
    }

    // Show loading state
    loadingDiv.classList.remove('hidden');
    searchBtn.disabled = true;

    await callAgent(inputText);
    searchBtn.disabled = false;
}

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    
    if (!data.response) {
        displayError('No results found');
        return;
    }

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(data.response);
    } catch (e) {
        parsedResponse = data.response;
    }

    let html = `
        <div class="product-card">
            <h3>API Response</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px;">${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;

    // Display main product recommendation
    if (parsedResponse.product_recommended_1) {
        const product = parsedResponse.product_recommended_1;
        html += `
            <div class="product-card">
                <h3>Top Recommendation</h3>
                <div class="product-info">
                    <p><strong>Product Code:</strong> ${product.product_code}</p>
                    <p><strong>Discount:</strong> ${product.discount}%</p>
                    <p><strong>Fit:</strong> ${product.fit_notes}</p>
                    ${product.tip2 ? `
                        <p><strong>Material:</strong> ${product.tip2.material}</p>
                        <p><strong>Season:</strong> ${product.tip2.season}</p>
                        <p><strong>Collection:</strong> ${product.tip2.collection}</p>
                        <p><strong>Details:</strong> ${product.tip2.product_specific_recommendation}</p>
                    ` : ''}
                    ${product.style_names && product.style_names.length > 0 ? `
                        <div>
                            <strong>Styles:</strong>
                            <div class="styles-list">
                                ${product.style_names.map(style => `<span class="style-tag">${style}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Display additional recommendations
    if (parsedResponse.product_recommended_2) {
        html += `
            <div class="product-card">
                <h3>Alternative Option</h3>
                <div class="product-info">
                    <p><strong>Product Code:</strong> ${parsedResponse.product_recommended_2}</p>
                </div>
            </div>
        `;
    }

    if (parsedResponse.product_recommended_3) {
        html += `
            <div class="product-card">
                <h3>Another Option</h3>
                <div class="product-info">
                    <p><strong>Product Code:</strong> ${parsedResponse.product_recommended_3}</p>
                </div>
            </div>
        `;
    }

    // Session info
    html += `
        <div class="session-info">
            Session: ${data.sessionId} | Event Count: ${data.eventCount}
        </div>
    `;

    resultsDiv.innerHTML = html;
}

function displayError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="product-card error">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Allow Enter key to trigger search
document.getElementById('inputText').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchProducts();
    }
});

async function toggleRecording() {
    const voiceBtn = document.getElementById('voiceBtn');
    const recordingStatus = document.getElementById('recordingStatus');

    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            isRecording = true;
            voiceBtn.classList.add('recording');
            voiceBtn.textContent = '⏹️';
            recordingStatus.classList.remove('hidden');
        } catch (error) {
            alert('Microphone access denied or not available: ' + error.message);
        }
    } else {
        mediaRecorder.stop();
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.textContent = '🎤';
        recordingStatus.classList.add('hidden');
    }
}

async function transcribeAudio(audioBlob) {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.textContent = 'Transcribing audio...';
    loadingDiv.classList.remove('hidden');

    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`);
        }

        const data = await response.json();
        const transcribedText = data.text;
        document.getElementById('inputText').value = transcribedText;
        
        // Automatically call the agent with transcribed text
        loadingDiv.textContent = 'Searching...';
        await callAgent(transcribedText);
    } catch (error) {
        loadingDiv.classList.add('hidden');
        alert('Transcription error: ' + error.message);
    }
}

async function callAgent(inputText) {
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    resultsDiv.innerHTML = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputText: inputText,
                sessionId: sessionId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        displayError(error.message);
    } finally {
        loadingDiv.classList.add('hidden');
    }
}
