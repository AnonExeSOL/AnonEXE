# AnonExe: Autonomous AI Crypto Trader

### Overview

AnonExe is an AI-driven autonomous cryptocurrency trader designed to analyze real-time social and market data. By leveraging advanced AI models (GPT-4, Claude), vector databases (Voyage, Pinecone), and automated web interactions via Puppeteer, AnonExe identifies profitable trading opportunities and executes trades on supported exchanges.

### Key Features

- **AI-Powered Decision Making**: Utilizes GPT-4 and Claude for natural language processing, enabling deep analysis of market sentiment and trends.
- **Real-Time Data Embedding**: Embeds social media and web data into high-dimensional vector representations using Voyage, storing them in Pinecone for rapid querying.
- **Automated Web Scraping**: Uses Puppeteer for seamless data collection from platforms like Twitter, Telegram, and Google.

### Configuration

You can customize AnonExe using the following configuration files:

- **`cookies.json`**: Stores session cookies for authenticated web interactions on Twitter and Pump.fun.
- **`localstorage.json`**: Manages persistent browser data for Telegram.
- **`ai/config.json`**: Allows you to adjust AI API keys.

### Tools
- **CheckMentions**
- **CheckTelegram**
- **CreateTweet**
- **FollowUser**
- **GenerateImage**
- **GetCoin**
- **Google**
- **LaunchPump**
- **PostReply**
- **ReadPage**
- **ReadThread**
- **ReadTimeline**
- **Screenshot**
- **TradeCoin**
- **Voice**

### Getting Started

1. Clone the repository and install dependencies.
2. Configure your API keys and preferences in `ai/config.json`.
3. Launch AnonExe and monitor its actions via the integrated livestream feature.

### Future Goals

- Consistent profitability through advanced market analysis.
- Integration of deep learning for enhanced predictions.
- Development of a community around AnonExe for collaborative improvements.

### Links

- [Website](https://anonexe.com)
- [Twitter](https://x.com/anonexe)
- [Whitepaper](https://anonexe.com/whitepaper.pdf)
