const { Pinecone } = require('@pinecone-database/pinecone');
const axios = require('axios');

class AIManager {

    constructor() {
        const config = require('./config.json');
        
        // Initialize Pinecone
        this.pinecone = new Pinecone({
            apiKey: config.pineconeApiKey,
        });
        this.index = this.pinecone.index('anonexe');
        
        // Voyage AI config
        this.voyageApiKey = config.voyageApiKey;
        this.voyageBaseUrl = 'https://api.voyageai.com/v1';
        
        // Rate limiting
        this.lastRequestTime = 0;
        this.minRequestInterval = 2000;
        this.maxRetries = 3;
    }

    async learnFromTweet(tweet) {
        try {
            // Get embedding from Voyage AI
            const embedding = await this.getEmbedding(tweet.account_handle + " : " + tweet.content);
            
            let matches = await this.queryIndex(tweet.content, { content: { '$eq': tweet.content }});

            if (matches.matches.length > 0) {
                //console.log("Tweet already exists in index");
                return;
            }

            // Store in Pinecone
            await this.index.upsert([{
                id: `tweet-${tweet.timestamp}-${tweet.account_handle}`,
                values: embedding,
                metadata: {
                    content: tweet.content,
                    account_handle: tweet.account_handle,
                    timestamp: tweet.timestamp,
                    likes: tweet.engagement_metrics.likes,
                    retweets: tweet.engagement_metrics.retweets
                }
            }]);

            //console.log(`Embedded and stored tweet by ${tweet.account_handle}`);
            return tweet;
        } catch (error) {
            throw error;
        }
    }

    async getEmbedding(text, retryCount = 0) {
        try {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
                );
            }

            const response = await axios.post(
                `${this.voyageBaseUrl}/embeddings`,
                {
                    input: [text],
                    model: 'voyage-large-2'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.voyageApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            this.lastRequestTime = Date.now();
            return response.data.data[0].embedding;

        } catch (error) {
            if (error.response?.status === 429 && retryCount < this.maxRetries) {

                
                const delay = 2000 * Math.pow(2, retryCount);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.getEmbedding(text, retryCount + 1);
            }
            throw error;
        }
    }

    async queryIndex(text, filter, results = 10) {
        const vector = await this.getEmbedding(text);

        try {
            const response = await this.index.namespace("").query({
                topK: results,
                vector: vector,
                includeValues: true,
                includeMetadata: true,
                filter: filter
            });

            
            return response;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = AIManager;