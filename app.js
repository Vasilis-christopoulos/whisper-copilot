const API_URL = 'https://8abneslr0c.execute-api.us-east-1.amazonaws.com/prod/invoke';
let sessionId = generateSessionId();
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let currentMode = 'apprentice';

function generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getImagePath(articleId) {
    // Image filenames have leading zero (e.g., 0672357001.jpg)
    // API returns article IDs without leading zero (e.g., 672357001)
    const paddedId = articleId.toString().padStart(10, '0');
    return `grouped_images/${paddedId}.jpg`;
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
        const productId = 'product-1';
        
        // Handle both old and new formats
        const productCode = product.article_id || product.product_code;
        const fitNotes = product.fit_notes || product.fit_notes;
        const discount = product.discount;
        
        // Handle tip2 - can be string (new format) or object (old format)
        let detailsText = '';
        if (product.tip2) {
            if (typeof product.tip2 === 'string') {
                // New format: tip2 is a string
                detailsText = product.tip2;
            } else if (typeof product.tip2 === 'object') {
                // Old format: tip2 is an object
                detailsText = product.tip2.product_specific_recommendation || '';
            }
        }
        
        html += `
            <div class="product-card">
                <h3>Top Recommendation</h3>
                <div class="product-display">
                    <div class="product-image-container">
                        <img src="${getImagePath(productCode)}" 
                             alt="Product ${productCode}" 
                             class="product-image"
                             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';">
                        <p class="product-code-label">Product Code: ${productCode}</p>
                    </div>
                    
                    <div class="product-info">
                        ${detailsText ? `<p><strong>Details:</strong> ${detailsText}</p>` : ''}
                        
                        ${product.tip2 && typeof product.tip2 === 'object' ? `
                            <p><strong>Material:</strong> ${product.tip2.material}</p>
                            <p><strong>Season:</strong> ${product.tip2.season}</p>
                            <p><strong>Collection:</strong> ${product.tip2.collection}</p>
                        ` : ''}
                        
                        <div class="collapsible-section">
                            <button class="info-btn" onclick="toggleInfo('${productId}-discount')">Discount</button>
                            <div id="${productId}-discount" class="info-content hidden">
                                <p>${discount}%</p>
                            </div>
                        </div>
                        
                        <div class="collapsible-section">
                            <button class="info-btn" onclick="toggleInfo('${productId}-fit')">Fit</button>
                            <div id="${productId}-fit" class="info-content hidden">
                                <p>${fitNotes}</p>
                            </div>
                        </div>
                        
                        ${product.style_names && product.style_names.length > 0 ? `
                            <div class="collapsible-section">
                                <button class="info-btn" onclick="toggleInfo('${productId}-styles')">Styles</button>
                                <div id="${productId}-styles" class="info-content hidden">
                                    <div class="styles-list">
                                        ${product.style_names.map(style => `<span class="style-tag">${style}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Display additional recommendations
    if (parsedResponse.product_recommended_2) {
        html += `
            <div class="product-card">
                <h3>Alternative Option</h3>
                <div class="product-display">
                    <div class="product-image-container">
                        <img src="${getImagePath(parsedResponse.product_recommended_2)}" 
                             alt="Product ${parsedResponse.product_recommended_2}" 
                             class="product-image"
                             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';">
                        <p class="product-code-label">Product Code: ${parsedResponse.product_recommended_2}</p>
                    </div>
                </div>
            </div>
        `;
    }

    if (parsedResponse.product_recommended_3) {
        html += `
            <div class="product-card">
                <h3>Another Option</h3>
                <div class="product-display">
                    <div class="product-image-container">
                        <img src="${getImagePath(parsedResponse.product_recommended_3)}" 
                             alt="Product ${parsedResponse.product_recommended_3}" 
                             class="product-image"
                             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22300%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';">
                        <p class="product-code-label">Product Code: ${parsedResponse.product_recommended_3}</p>
                    </div>
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
    
    // Automatically speak the details field if it exists
    if (parsedResponse.product_recommended_1 && parsedResponse.product_recommended_1.tip2) {
        let details = '';
        if (typeof parsedResponse.product_recommended_1.tip2 === 'string') {
            // New format: tip2 is a string
            details = parsedResponse.product_recommended_1.tip2;
        } else if (typeof parsedResponse.product_recommended_1.tip2 === 'object') {
            // Old format: tip2 is an object
            details = parsedResponse.product_recommended_1.tip2.product_specific_recommendation;
        }
        
        if (details) {
            speakText(details);
        }
    }
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

// Initialize AWS Polly
let polly;
function initPolly() {
    if (!polly) {
        AWS.config.update({
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY,
            region: AWS_REGION
        });
        polly = new AWS.Polly();
    }
}

async function speakText(text) {
    initPolly();
    
    try {
        const params = {
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: 'Joanna',
            Engine: 'neural'
        };

        const data = await polly.synthesizeSpeech(params).promise();
        
        if (data.AudioStream) {
            const blob = new Blob([data.AudioStream], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.play();
        }
    } catch (error) {
        console.error('Polly error:', error);
        alert('Speech synthesis error: ' + error.message);
    }
}

function toggleInfo(elementId) {
    const element = document.getElementById(elementId);
    const isHidden = element.classList.contains('hidden');
    
    element.classList.toggle('hidden');
    
    // If showing the content, speak it
    if (isHidden) {
        const textContent = element.textContent.trim();
        speakText(textContent);
    }
}

function selectMode(mode) {
    currentMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    console.log(`Mode selected: ${mode}`);
    
    // Speak the intro message when mode is selected
    const introMessage = "For the sake of the demo, I'll keep the intro short for today. Greet warmly, ask what they need, scan products for stock and talking points. Use page buttons for common questions. Offer to hold unavailable sizes. The category of the day is boots!";
    speakText(introMessage);
}
