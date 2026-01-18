![Header Banner](banner-aldo.jpeg)
# ALDO Whisper - AI-Powered Retail Assistant
## Hackathon Context

This project was developed for the **ALDO x AWS Retail GenAI Hackathon**, demonstrating how generative AI can enhance the retail experience by empowering store employees with intelligent, context-aware product recommendations and won 1st place 🥇

> **Note:** The AWS backend environment has been decommissioned, so the application is currently non-operational. This repository serves as a showcase of the solution architecture and implementation.

## Overview

ALDO Whisper is an intelligent retail assistant designed to help ALDO store employees provide personalized product recommendations to customers, but also provide tips for selling and aligning with business needs, customized to employees level of experience. The system uses voice input, natural language processing, and AI-powered product matching to deliver contextual suggestions with detailed product information. It also utilizes a knowledge base to customize its answers per employee level and get guidelines of reasoning.

## Presentation

You can view a the full presentation here: [Presentation](https://prezi.com/view/mLQTayEuu8qdUC8ps3ef/?referral_token=nje3U6lnB3FN)

## Demo

Video: https://youtu.be/l5zIQtTFpz4

The application features a clean, mobile-first interface with three operational modes:
- **Onboarding**: For new employees learning the system
- **Apprentice**: Standard mode with guided assistance
- **Master**: Advanced mode for experienced staff

## Architecture

### Frontend
- **Technology**: Vanilla JavaScript, HTML5, CSS3
- **Voice Input**: OpenAI Whisper API for speech-to-text transcription
- **Voice Output**: Amazon Polly for text-to-speech synthesis
- **UI**: Responsive design optimized for mobile devices and tablets

### Backend (AWS)
The backend infrastructure was built entirely on AWS services:

1. **API Gateway**: RESTful API endpoint for frontend-backend communication
2. **AWS Lambda**: Serverless function to invoke the Bedrock Agent
3. **Amazon Bedrock Agent**: Core AI orchestration layer with:
   - **Knowledge Base**: Contains ALDO company policies, employee guidelines, and product promotion strategies
   - **Action Groups**: Lambda-powered tools for database queries and operations
4. **Amazon Aurora Serverless (PostgreSQL)**: Product database containing SKUs, features, pricing, and inventory
5. **Amazon CloudWatch**: Monitoring and tracing agent performance

### Data Flow

```
User Voice Input
    ↓
OpenAI Whisper (Transcription)
    ↓
Frontend (JavaScript)
    ↓
API Gateway
    ↓
Lambda Function
    ↓
Bedrock Agent
    ├── Knowledge Base (Company Policies)
    └── Action Groups (Database Tools)
            ↓
        Aurora PostgreSQL (Product Data)
    ↓
Structured JSON Response
    ↓
Frontend Rendering
    ↓
Amazon Polly (Voice Output)
```

## Features

### Voice Interaction
- **Push-to-talk**: Hold the microphone button to record queries
- **Automatic transcription**: Real-time speech-to-text conversion
- **Voice responses**: Key information spoken back using Amazon Polly's whisper effect

### Product Recommendations
- **Top recommendation**: Primary product suggestion with detailed information
- **Alternative options**: Up to 2 additional product recommendations
- **Product details**: 
  - High-resolution product images
  - Pricing information
  - Discount percentages
  - Fit notes
  - Style categories
  - AI-generated personalized recommendations

### Employee Modes
- **Onboarding**: Introductory guidance for new hires
- **Apprentice**: Standard operational mode
- **Master**: Advanced features for experienced staff

## Prerequisites
- Modern web browser with microphone access
- OpenAI API key (for Whisper transcription)
- AWS credentials (for Polly text-to-speech)

## Usage

1. **Select Mode**: Choose your experience level (Onboarding, Apprentice, or Master)
2. **Voice Input**: Hold the microphone button and speak your query (e.g., "I need boots for a customer who likes casual style")
3. **View Results**: Browse the AI-recommended products with detailed information
4. **Explore Details**: Tap buttons to hear discount info, fit notes, and style categories
5. **Refine Search**: Use the bottom input to ask follow-up questions

## Project Structure

```
aldo-whisper/
├── index.html              # Main application page
├── app.js                  # Core application logic
├── styles.css              # Styling and responsive design
├── config.example.js       # Configuration template
├── config.js              # API credentials (gitignored)
├── grouped_images/        # Product image assets
├── decorative_components/ # UI assets (logos, backgrounds)
└── README.md              # This file
```

## Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- OpenAI Whisper API
- AWS SDK for JavaScript
- Amazon Polly

### Backend (Decommissioned)
- AWS API Gateway
- AWS Lambda (Python/Node.js)
- Amazon Bedrock (AI Agent)
- Amazon Aurora Serverless (PostgreSQL)
- Amazon CloudWatch

## Key Implementation Details

### Voice Transcription
Uses OpenAI's Whisper model for accurate speech-to-text conversion, supporting natural language queries in retail environments.

### AI Agent Design
The Bedrock Agent was configured with:
- **System prompts**: Tailored for retail assistant behavior
- **Knowledge base**: RAG (Retrieval Augmented Generation) for company-specific information
- **Function calling**: Dynamic database queries based on customer requirements

### Response Format
The agent returns structured JSON with product recommendations:
```json
{
  "product_recommended_1": {
    "article_id": "672357001",
    "price": "129.99",
    "discount": 15,
    "fit_notes": "True to size",
    "style_names": ["Casual", "Boots"],
    "tip2": "Perfect for everyday wear..."
  },
  "product_recommended_2": {...},
  "product_recommended_3": {...}
}
```

## Limitations

- **Backend unavailable**: AWS infrastructure has been decommissioned
- **API costs**: Requires active OpenAI and AWS accounts
- **Browser compatibility**: Requires modern browser with Web Audio API support
- **Microphone required**: Voice input needs device microphone access

## License

MIT License - See LICENSE file for details

## Acknowledgments

- ALDO Group for the hackathon opportunity
- AWS for the cloud infrastructure
- OpenAI for Whisper transcription technology

---
