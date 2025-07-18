const axios = require('axios');

class MarketingAgent {
    constructor() {
        // Initialize agent with API key from environment
        this.apiKey = process.env.MOONSHOT_API_KEY;
        if (!this.apiKey) {
            throw new Error('MOONSHOT_API_KEY environment variable is required');
        }
    }

    async generateContent(prompt) {
        // For development - use mock responses when API key is placeholder
        if (this.apiKey === 'your-api-key') {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            return `Mock generated content for: ${prompt}`;
        }
        
        try {
            const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
                model: 'moonshot-v1-8k',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }

    async generateSocialContent(platform, topic, tone = 'friendly', length = 'medium') {
        const prompt = `Create a ${length} ${tone} social media post for ${platform} about ${topic}`;
        const content = await this.generateContent(prompt);
        
        return {
            platform,
            content,
            generated_at: new Date().toISOString(),
            metadata: {
                tone,
                length,
                topic
            }
        };
    }

    async planCampaign(objective, target_audience, budget, duration) {
        const prompt = `Create a marketing campaign plan with:
- Objective: ${objective}
- Target Audience: ${target_audience}
- Budget: $${budget}
- Duration: ${duration}`;

        const campaignPlan = await this.generateContent(prompt);
        
        return {
            campaign_plan: campaignPlan,
            created_at: new Date().toISOString(),
            status: 'draft',
            details: {
                objective,
                target_audience,
                budget,
                duration
            }
        };
    }

    getAgentCard() {
        return {
            id: 'marketing-agent-v1',
            name: 'Marketing Agent',
            description: 'AI-powered marketing content and campaign generator',
            capabilities: [
                'Generate social media content',
                'Plan marketing campaigns',
                'Analyze market trends'
            ],
            preferred_model: 'moonshot-v1-32k',
            supports_streaming: true
        };
    }
}

module.exports = MarketingAgent;
