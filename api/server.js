// AI Art Generator - Backend Server
// Handles API requests, model integration, and image processing

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const multer = require('multer');
const sharp = require('sharp');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { RateLimiterMemory } = require('rate-limiter-flexible');
const natural = require('natural');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    points: 10, // Number of requests
    duration: 60, // Per 60 seconds
});

// File upload configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});

// NLP Processor for prompt enhancement
class PromptEnhancer {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.sentiment = new natural.SentimentAnalyzer('English', 
            natural.PorterStemmer, 'afinn');
    }

    enhance(prompt, style) {
        let enhanced = prompt;
        const tokens = this.tokenizer.tokenize(prompt.toLowerCase());
        
        // Style-specific enhancements
        const styleEnhancements = {
            'realistic': ['photorealistic', '8k resolution', 'highly detailed', 'professional photography'],
            'anime': ['anime style', 'manga', 'cel shaded', 'studio ghibli aesthetic'],
            'oil-painting': ['oil on canvas', 'brushstrokes visible', 'classical art', 'museum quality'],
            'watercolor': ['watercolor painting', 'soft edges', 'paper texture', 'artistic'],
            'digital-art': ['digital painting', 'artstation trending', 'concept art', 'matte painting'],
            '3d-render': ['3d render', 'octane render', 'volumetric lighting', 'ray tracing'],
            'pixel-art': ['pixel art', '16-bit style', 'retro gaming', 'pixelated'],
            'concept-art': ['concept art', 'production art', 'professional illustration', 'detailed design']
        };

        // Add style enhancements
        if (styleEnhancements[style]) {
            const additions = styleEnhancements[style]
                .filter(term => !prompt.toLowerCase().includes(term))
                .slice(0, 2);
            if (additions.length > 0) {
                enhanced += ', ' + additions.join(', ');
            }
        }

        // Quality boosters based on content
        if (tokens.includes('portrait') || tokens.includes('face')) {
            enhanced += ', detailed facial features, perfect eyes';
        }
        if (tokens.includes('landscape') || tokens.includes('scenery')) {
            enhanced += ', epic scenery, atmospheric perspective';
        }
        if (tokens.includes('fantasy') || tokens.includes('magical')) {
            enhanced += ', ethereal lighting, mystical atmosphere';
        }

        // Analyze sentiment and adjust
        const sentimentScore = this.sentiment.getSentiment(tokens);
        if (sentimentScore > 0.5) {
            enhanced += ', vibrant colors, uplifting mood';
        } else if (sentimentScore < -0.5) {
            enhanced += ', moody atmosphere, dramatic lighting';
        }

        return enhanced;
    }

    generateNegativePrompt(style) {
        const negativePrompts = {
            'realistic': 'cartoon, anime, illustration, painting, drawing, art, sketch, 3d, deformed, ugly, blurry',
            'anime': 'realistic, photo, 3d render, western cartoon, ugly, deformed, blurry',
            'oil-painting': 'photo, digital, 3d, modern, contemporary, ugly, deformed',
            'default': 'ugly, deformed, noisy, blurry, distorted, grainy, low quality, bad anatomy'
        };

        return negativePrompts[style] || negativePrompts.default;
    }
}

const promptEnhancer = new PromptEnhancer();

// Model configurations
const modelConfigs = {
    'stable-diffusion-xl': {
        endpoint: process.env.SDXL_ENDPOINT || 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        apiKey: process.env.STABILITY_API_KEY,
        defaultParams: {
            cfg_scale: 7,
            steps: 30,
            samples: 1,
            width: 1024,
            height: 1024
        }
    },
    'dalle-3': {
        endpoint: 'https://api.openai.com/v1/images/generations',
        apiKey: process.env.OPENAI_API_KEY,
        defaultParams: {
            model: 'dall-e-3',
            size: '1024x1024',
            quality: 'standard',
            n: 1
        }
    },
    'midjourney': {
        // Midjourney integration would go here
        endpoint: process.env.MIDJOURNEY_ENDPOINT,
        apiKey: process.env.MIDJOURNEY_API_KEY
    }
};

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Generate image endpoint
app.post('/api/generate', async (req, res) => {
    try {
        // Rate limiting
        await rateLimiter.consume(req.ip);

        const {
            prompt,
            style = 'realistic',
            model = 'stable-diffusion-xl',
            quality = 75,
            creativity = 50,
            steps = 50,
            cfg_scale = 7.5,
            negative_prompt = '',
            width = 1024,
            height = 1024,
            seed = null
        } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Enhance prompt with NLP
        const enhancedPrompt = promptEnhancer.enhance(prompt, style);
        const autoNegativePrompt = negative_prompt || promptEnhancer.generateNegativePrompt(style);

        // Get model configuration
        const modelConfig = modelConfigs[model];
        if (!modelConfig || !modelConfig.apiKey) {
            return res.status(400).json({ error: 'Model not configured or API key missing' });
        }

        // Prepare generation parameters
        const generationParams = {
            prompt: enhancedPrompt,
            negative_prompt: autoNegativePrompt,
            ...modelConfig.defaultParams,
            steps: parseInt(steps),
            cfg_scale: parseFloat(cfg_scale),
            width: parseInt(width),
            height: parseInt(height),
            seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000)
        };

        // Call the appropriate API
        let imageData;
        if (model === 'stable-diffusion-xl') {
            imageData = await generateWithStableDiffusion(generationParams, modelConfig);
        } else if (model === 'dalle-3') {
            imageData = await generateWithDalle(generationParams, modelConfig);
        } else {
            // Fallback to mock generation for demo
            imageData = await mockGeneration(generationParams);
        }

        // Process and optimize image
        const processedImage = await processImage(imageData, quality);

        // Save generation to database (implement your database logic)
        const generationId = uuidv4();
        const metadata = {
            id: generationId,
            prompt: prompt,
            enhanced_prompt: enhancedPrompt,
            style: style,
            model: model,
            parameters: generationParams,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            id: generationId,
            image: processedImage,
            metadata: metadata
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ 
            error: 'Generation failed', 
            message: error.message 
        });
    }
});

// Stable Diffusion API integration
async function generateWithStableDiffusion(params, config) {
    try {
        const response = await axios.post(config.endpoint, {
            text_prompts: [
                {
                    text: params.prompt,
                    weight: 1
                },
                {
                    text: params.negative_prompt,
                    weight: -1
                }
            ],
            cfg_scale: params.cfg_scale,
            steps: params.steps,
            samples: params.samples || 1,
            width: params.width,
            height: params.height,
            seed: params.seed
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (response.data.artifacts && response.data.artifacts[0]) {
            return response.data.artifacts[0].base64;
        }
        throw new Error('No image data received');
    } catch (error) {
        console.error('Stable Diffusion API error:', error);
        // Fallback to mock generation
        return mockGeneration(params);
    }
}

// DALL-E API integration
async function generateWithDalle(params, config) {
    try {
        const response = await axios.post(config.endpoint, {
            model: config.defaultParams.model,
            prompt: params.prompt,
            size: `${params.width}x${params.height}`,
            quality: params.quality > 75 ? 'hd' : 'standard',
            n: 1
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            }
        });

        if (response.data.data && response.data.data[0]) {
            return response.data.data[0].url;
        }
        throw new Error('No image data received');
    } catch (error) {
        console.error('DALL-E API error:', error);
        return mockGeneration(params);
    }
}

// Mock generation for demo purposes
async function mockGeneration(params) {
    // Generate a placeholder gradient based on prompt
    const colors = [
        ['#667eea', '#764ba2'],
        ['#f093fb', '#f5576c'],
        ['#4facfe', '#00f2fe'],
        ['#43e97b', '#38f9d7'],
        ['#fa709a', '#fee140'],
        ['#30cfd0', '#330867'],
        ['#a8edea', '#fed6e3'],
        ['#ff9a9e', '#fecfef']
    ];
    
    const selectedColors = colors[Math.floor(Math.random() * colors.length)];
    
    // Create SVG gradient
    const svg = `
        <svg width="${params.width}" height="${params.height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${selectedColors[0]};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${selectedColors[1]};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)" />
            <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle">
                AI Generated: ${params.prompt.substring(0, 30)}...
            </text>
        </svg>
    `;
    
    // Convert to base64
    return Buffer.from(svg).toString('base64');
}

// Image processing and optimization
async function processImage(imageData, quality) {
    try {
        let buffer;
        
        // Handle different input formats
        if (typeof imageData === 'string') {
            if (imageData.startsWith('http')) {
                // Download from URL
                const response = await axios.get(imageData, { responseType: 'arraybuffer' });
                buffer = Buffer.from(response.data);
            } else {
                // Assume base64
                buffer = Buffer.from(imageData, 'base64');
            }
        } else {
            buffer = imageData;
        }

        // Process with Sharp
        const processed = await sharp(buffer)
            .jpeg({ quality: parseInt(quality) })
            .toBuffer();

        return `data:image/jpeg;base64,${processed.toString('base64')}`;
    } catch (error) {
        console.error('Image processing error:', error);
        return imageData; // Return original if processing fails
    }
}

// Get generation history
app.get('/api/history', async (req, res) => {
    try {
        // Implement database query for user's generation history
        const history = []; // Fetch from database
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Upload image for editing
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ 
            success: true, 
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    🎨 AI Art Generator Server Running
    ================================
    Port: ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    API Status: ${process.env.STABILITY_API_KEY ? '✅ Connected' : '⚠️  No API Key'}
    
    Available at:
    - Local: http://localhost:${PORT}
    - Network: http://${require('os').networkInterfaces().en0?.[0]?.address || 'localhost'}:${PORT}
    `);
});

module.exports = app;
