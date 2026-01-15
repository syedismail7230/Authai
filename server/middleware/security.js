// Security and Performance Middleware Configuration
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// Rate Limiters
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later.'
});

export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many payment attempts, please try again later.'
});

export const analysisLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 analyses per minute
    message: 'Analysis rate limit exceeded, please wait.'
});

// Helmet Configuration
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "https://checkout.razorpay.com"],
            connectSrc: ["'self'", "https://api.authai.pro", "wss://api.authai.pro"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Input Validation Rules
export const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must be 8+ chars with uppercase, lowercase, and number')
];

export const analysisValidation = [
    body('content').notEmpty().isLength({ max: 100000 }).withMessage('Content required (max 100KB)'),
    body('contentType').isIn(['TEXT', 'IMAGE', 'AUDIO', 'VIDEO']).withMessage('Invalid content type')
];

// Validation Error Handler
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: errors.array() 
        });
    }
    next();
};

// CORS Configuration
export const corsOptions = (allowedOrigins) => ({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Request Logger
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        }));
    });
    next();
};

// Error Handler
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Don't leak error details in production
    const isDev = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
        error: isDev ? err.message : 'Internal server error',
        ...(isDev && { stack: err.stack })
    });
};
