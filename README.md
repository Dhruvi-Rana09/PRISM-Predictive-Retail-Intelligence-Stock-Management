# PRISM - Predictive Retail Intelligence & Stock Management  
**Team:** Pixel Pirates  
**Hackathon:** CyFuture AI - Phase I Evaluation  
**Project ID:** cyf1432  
## Project Overview
PRISM is an innovative AI-driven solution designed for online retailers seeking to revolutionize their inventory management and sales strategies. Unlike traditional reactive approaches, PRISM empowers sellers with intelligent, data-backed insights to predict demand, optimize inventory, and personalize discounts in real-time.  
Because the future of retail isn't reactive. It's predictive.  

## Demo Implementation
**Important Note**
This repository's branch " behaviour analytics " contains a demo implementation created for Phase I evaluation purposes. The AI models described in the architecture are implemented as rule-based decision systems rather than fully trained machine learning models.  
## Demo Features
  
Simulated behavioral tracking  
Rule-based pricing recommendations  
Mock inventory alerts  
Sample customer segmentation  
Dashboard with synthetic data  

## Demo Limitations
  
AI models are simplified rule-based systems  
Real-time learning capabilities are simulated  
Limited to demonstration data sets  
Full ML pipeline not implemented  

## Technical Architecture(of the full actual version) 
**Tier 1: Real-Time Behavioral Inference (< 50ms)**  
  
Frontend Tracking: Lightweight JavaScript SDK captures user interactions  
Event Processing: REST API with Redis caching for instant behavior scoring  
Dynamic Updates: Real-time pricing and offer adjustments  
  
**Tier 2: Near Real-Time Decisions (15-30 min)**  

Behavioral Aggregation: MongoDB storage with batch processing  
Pricing Engine: LSTM forecasting + RL optimization  
Engagement Triggers: Automated email/WhatsApp campaigns  
  
**Tier 3: Deep Intelligence (Hourly/Daily)**  

Demand Forecasting: Transformer-based models for long-term predictions  
Customer Segmentation: Autoencoder clustering for behavioral cohorts  
Inventory Automation: Smart restock recommendations  
  
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# Clone the repository
git clone --branch behaviour-analytics --single-branch https://github.com/Dhruvi-Rana09/PRISM-Predictive-Retail-Intelligence-Stock-Management.git
cd PRISM-Predictive-Retail-Intelligence-Stock-Management

# Install dependencies
npm install

# Set up environment variables
cp .env.local #here the firebase apis should be pasted.

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.  
to view the seller dashboard Open [http://localhost:3000/sellerdash](http://localhost:3000/sellerdash)
<!--
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->

