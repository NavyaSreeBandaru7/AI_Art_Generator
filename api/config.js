// AI Art Generator - Configuration File
// Central configuration for the application

const config = {
    // API Configuration
    api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        timeout: 30000,
        retries: 3,
        rateLimitPerMinute: 10
    },

    // Model Configurations
    models: {
        'stable-diffusion-xl': {
            name: 'Stable Diffusion XL',
            endpoint: process.env.SDXL_ENDPOINT || 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            apiKey: process.env.STABILITY_API_KEY,
            capabilities: {
                maxWidth: 1024,
                maxHeight: 1024,
                styles: ['realistic', 'anime', 'oil-painting', 'watercolor', 'digital-art', '3d-render'],
                supportsBatch: true,
                supportsInpainting: true,
                supportsOutpainting: true
            },
            defaultParams: {
                cfg_scale: 7,
                steps: 30,
                samples: 1,
                width: 1024,
                height: 1024,
                sampler: 'K_DPMPP_2M'
            },
            pricing: {
                perImage: 0.02,
                currency: 'USD'
            }
        },
        'stable-diffusion-2': {
            name: 'Stable Diffusion 2.1',
            endpoint: process.env.SD2_ENDPOINT || 'https://api.stability.ai/v1/generation/stable-diffusion-512-v2-1/text-to-image',
            apiKey: process.env.STABILITY_API_KEY,
            capabilities: {
                maxWidth: 768,
                maxHeight: 768,
                styles: ['realistic', 'artistic', 'anime', 'sketch'],
                supportsBatch: true,
                supportsInpainting: false,
                supportsOutpainting: false
            },
            defaultParams: {
                cfg_scale: 7.5,
                steps: 50,
                samples: 1,
                width: 512,
                height: 512
            },
            pricing: {
                perImage: 0.01,
                currency: 'USD'
            }
        },
        'dalle-3': {
            name: 'DALL-E 3',
            endpoint: 'https://api.openai.com/v1/images/generations',
            apiKey: process.env.OPENAI_API_KEY,
            capabilities: {
                maxWidth: 1792,
                maxHeight: 1792,
                styles: ['natural', 'vivid'],
                supportsBatch: false,
                supportsInpainting: false,
                supportsOutpainting: false
            },
            defaultParams: {
                model: 'dall-e-3',
                size: '1024x1024',
                quality: 'standard',
                n: 1
            },
            pricing: {
                perImage: 0.04,
                currency: 'USD'
            }
        },
        'midjourney': {
            name: 'Midjourney v6',
            endpoint: process.env.MIDJOURNEY_ENDPOINT,
            apiKey: process.env.MIDJOURNEY_API_KEY,
            capabilities: {
                maxWidth: 2048,
                maxHeight: 2048,
                styles: ['default', 'raw', 'stylize'],
                supportsBatch: true,
                supportsInpainting: true,
                supportsOutpainting: true
            },
            defaultParams: {
                version: '6',
                quality: 1,
                stylize: 100
            },
            pricing: {
                perImage: 0.03,
                currency: 'USD'
            }
        },
        'custom': {
            name: 'Custom Model',
            endpoint: process.env.CUSTOM_MODEL_ENDPOINT,
            apiKey: process.env.CUSTOM_MODEL_API_KEY,
            capabilities: {
                maxWidth: 2048,
                maxHeight: 2048,
                styles: ['custom'],
                supportsBatch: true,
                supportsInpainting: false,
                supportsOutpainting: false
            },
            defaultParams: {},
            pricing: {
                perImage: 0.01,
                currency: 'USD'
            }
        }
    },

    // Style Configurations
    styles: {
        'realistic': {
            name: 'Photorealistic',
            modifiers: 'photorealistic, high detail, professional photography, 8k resolution, sharp focus',
            negativePrompt: 'cartoon, anime, illustration, painting, drawing, art, sketch, 3d, deformed',
            settings: {
                cfg_scale: 7,
                steps: 50
            }
        },
        'anime': {
            name: 'Anime/Manga',
            modifiers: 'anime style, manga, cel shaded, studio ghibli, japanese animation',
            negativePrompt: 'realistic, photo, 3d render, western cartoon, ugly, deformed',
            settings: {
                cfg_scale: 10,
                steps: 40
            }
        },
        'oil-painting': {
            name: 'Oil Painting',
            modifiers: 'oil painting, canvas texture, brushstrokes, classical art, traditional media',
            negativePrompt: 'photo, digital, 3d, modern, contemporary, ugly',
            settings: {
                cfg_scale: 8,
                steps: 60
            }
        },
        'watercolor': {
            name: 'Watercolor',
            modifiers: 'watercolor painting, soft edges, paper texture, artistic, traditional',
            negativePrompt: 'photo, digital, 3d, hard edges, sharp',
            settings: {
                cfg_scale: 9,
                steps: 45
            }
        },
        'digital-art': {
            name: 'Digital Art',
            modifiers: 'digital painting, artstation, concept art, matte painting, trending',
            negativePrompt: 'photo, traditional media, canvas, paper',
            settings: {
                cfg_scale: 7.5,
                steps: 40
            }
        },
        '3d-render': {
            name: '3D Render',
            modifiers: '3d render, octane render, unreal engine, volumetric lighting, ray tracing',
            negativePrompt: '2d, flat, painting, drawing, sketch',
            settings: {
                cfg_scale: 8,
                steps: 50
            }
        },
        'pixel-art': {
            name: 'Pixel Art',
            modifiers: 'pixel art, 16-bit, retro gaming, pixelated, low resolution',
            negativePrompt: 'smooth, high resolution, realistic, 3d',
            settings: {
                cfg_scale: 10,
                steps: 30
            }
        },
        'concept-art': {
            name: 'Concept Art',
            modifiers: 'concept art, production art, professional illustration, detailed design',
            negativePrompt: 'photo, amateur, sketch, unfinished',
            settings: {
                cfg_scale: 7,
                steps: 50
            }
        },
        'abstract': {
            name: 'Abstract',
            modifiers: 'abstract art, non-representational, modern art, contemporary',
            negativePrompt: 'realistic, photo, figurative, representational',
            settings: {
                cfg_scale: 12,
                steps: 40
            }
        },
        'surreal': {
            name: 'Surrealism',
            modifiers: 'surreal, dreamlike, salvador dali style, impossible geometry',
            negativePrompt: 'realistic, mundane, ordinary, logical',
            settings: {
                cfg_scale: 11,
                steps: 55
            }
        }
    },

    // Preset Prompts for Quick Start
    presets: {
        portraits: [
            'Beautiful portrait of a woman with flowing hair, golden hour lighting',
            'Wise old wizard with long beard, mystical atmosphere',
            'Cyberpunk character with neon implants, night city background'
        ],
        landscapes: [
            'Majestic mountain range at sunset, dramatic clouds',
            'Enchanted forest with glowing mushrooms, fairy lights',
            'Futuristic city skyline, flying cars, neon lights'
        ],
        fantasy: [
            'Dragon perched on castle tower, moonlit night',
            'Magical portal in ancient ruins, swirling energy',
            'Floating islands in the sky, waterfalls, rainbow bridges'
        ],
        scifi: [
            'Space station orbiting alien planet, nebula background',
            'Robot uprising in dystopian city, dramatic lighting',
            'Time machine laboratory, electrical arcs, steampunk aesthetic'
        ]
    },

    // NLP Enhancement Rules
    nlp: {
        qualityBoosters: [
            'masterpiece',
            'best quality',
            'highly detailed',
            'ultra-detailed',
            'professional',
            'award winning'
        ],
        lightingTerms: [
            'dramatic lighting',
            'volumetric lighting',
            'cinematic lighting',
            'studio lighting',
            'rim lighting',
            'golden hour'
        ],
        compositionTerms: [
            'rule of thirds',
            'centered composition',
            'dynamic angle',
            'symmetrical',
            'depth of field',
            'bokeh'
        ],
        avoidTerms: [
            'low quality',
            'bad anatomy',
            'blurry',
            'pixelated',
            'error',
            'cropped',
            'worst quality',
            'jpeg artifacts'
        ]
    },

    // Application Settings
    app: {
        maxHistoryItems: 100,
        autoSaveInterval: 30000, // 30 seconds
        thumbnailSize: 256,
        compressionQuality: 85,
        supportedFormats: ['png', 'jpg', 'webp'],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        cacheExpiration: 86400000, // 24 hours
        enableAnalytics: true,
        enableTelemetry: false
    },

    // Feature Flags
    features: {
        enableBatchGeneration: true,
        enableInpainting: true,
        enableOutpainting: true,
        enableUpscaling: true,
        enableVariations: true,
        enablePromptHistory: true,
        enableCloudSync: false,
        enableCollaboration: false,
        enableNFTMinting: false,
        enableVideoGeneration: false,
        enable3DGeneration: false,
        maxBatchSize: 4,
        maxVariations: 4
    },

    // Database Configuration
    database: {
        type: process.env.DB_TYPE || 'mongodb',
        uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/ai-art-generator',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10
        }
    },

    // Redis Cache Configuration
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        ttl: 3600 // 1 hour
    },

    // Storage Configuration
    storage: {
        type: process.env.STORAGE_TYPE || 'local', // 'local', 's3', 'cloudinary'
        local: {
            uploadDir: './uploads',
            publicPath: '/uploads'
        },
        s3: {
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION || 'us-east-1',
            accessKey: process.env.S3_ACCESS_KEY,
            secretKey: process.env.S3_SECRET_KEY
        },
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET
        }
    },

    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        jwtExpiration: '7d',
        bcryptRounds: 10,
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        rateLimiting: {
            windowMs: 60000, // 1 minute
            maxRequests: 10
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.stability.ai", "https://api.openai.com"]
            }
        }
    },

    // Social Media Integration
    social: {
        enableSharing: true,
        platforms: {
            twitter: {
                enabled: true,
                apiKey: process.env.TWITTER_API_KEY,
                apiSecret: process.env.TWITTER_API_SECRET
            },
            instagram: {
                enabled: true,
                apiKey: process.env.INSTAGRAM_API_KEY,
                apiSecret: process.env.INSTAGRAM_API_SECRET
            },
            pinterest: {
                enabled: true,
                apiKey: process.env.PINTEREST_API_KEY,
                apiSecret: process.env.PINTEREST_API_SECRET
            }
        }
    },

    // Analytics Configuration
    analytics: {
        googleAnalytics: {
            enabled: process.env.GA_ENABLED === 'true',
            trackingId: process.env.GA_TRACKING_ID
        },
        customEvents: {
            generation: true,
            download: true,
            share: true,
            error: true
        }
    }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
    config.app.enableTelemetry = true;
    config.security.rateLimiting.maxRequests = 5;
} else if (process.env.NODE_ENV === 'development') {
    config.app.enableAnalytics = false;
    config.security.rateLimiting.maxRequests = 100;
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.CONFIG = config;
}
