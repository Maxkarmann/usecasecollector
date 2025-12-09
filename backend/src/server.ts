import express, {
  Application,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient, Prisma } from '@prisma/client';
import { body, param, query, validationResult, ValidationError } from 'express-validator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma Client with logging
const prisma = new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize Express Application
const app: Application = express();
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const API_KEY = process.env['API_KEY'] ?? '';

// =============================================================================
// CUSTOM ERROR CLASSES
// =============================================================================

class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationAppError extends AppError {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed', 400, true);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationAppError.prototype);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`, 404, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized: Invalid or missing API key') {
    super(message, 401, true);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// =============================================================================
// INTERFACES
// =============================================================================

interface UseCaseCreateRequest {
  useCase: string;
  conceptDescription: string;
  concreteImplementation?: string;
  benefit?: string;
  industry?: string;
  department?: string;
  valueChainStep?: string;
  url?: string;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
  industry?: string;
  valueChainStep?: string;
  department?: string;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    industry: string | null;
    valueChainStep: string | null;
    department: string | null;
    search: string | null;
  };
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));

// API Key Authentication Middleware for POST requests
const apiKeyAuthMiddleware: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.method === 'POST') {
    const providedApiKey = req.headers['x-api-key'];
    
    if (!API_KEY) {
      console.warn('WARNING: API_KEY is not configured. POST requests are unprotected.');
      next();
      return;
    }

    if (!providedApiKey || providedApiKey !== API_KEY) {
      next(new UnauthorizedError());
      return;
    }
  }
  next();
};

app.use('/api', apiKeyAuthMiddleware);

// =============================================================================
// VALIDATION RULES
// =============================================================================

const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

const createUseCaseValidation = [
  body('useCase')
    .trim()
    .notEmpty()
    .withMessage('Use case name is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Use case must be between 3 and 500 characters'),
  body('conceptDescription')
    .trim()
    .notEmpty()
    .withMessage('Concept description is required')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Concept description must be between 10 and 10000 characters'),
  body('concreteImplementation')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Concrete implementation must not exceed 10000 characters'),
  body('benefit')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Benefit must not exceed 5000 characters'),
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Industry must not exceed 200 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Department must not exceed 200 characters'),
  body('valueChainStep')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Value chain step must not exceed 200 characters'),
  body('url')
    .optional()
    .trim()
    .custom((value: string) => {
      if (value && value.length > 0 && !urlRegex.test(value)) {
        throw new Error('Invalid URL format');
      }
      return true;
    }),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('industry')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  query('valueChainStep')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  query('department')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 500 }),
];

const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
];

// Validation result handler
const handleValidationErrors: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new ValidationAppError(errors.array()));
    return;
  }
  next();
};

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /api/use-cases - List all use cases with pagination and filtering
app.get(
  '/api/use-cases',
  paginationValidation,
  handleValidationErrors,
  async (req: Request<object, object, object, PaginationQuery>, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page ?? '1', 10);
      const limit = parseInt(req.query.limit ?? '20', 10);
      const skip = (page - 1) * limit;

      const industry = req.query.industry?.trim() ?? null;
      const valueChainStep = req.query.valueChainStep?.trim() ?? null;
      const department = req.query.department?.trim() ?? null;
      const search = req.query.search?.trim() ?? null;

      // Build where clause
      const where: Prisma.UseCaseWhereInput = {};

      if (industry) {
        where.industry = {
          equals: industry,
          mode: 'insensitive',
        };
      }

      if (valueChainStep) {
        where.valueChainStep = {
          equals: valueChainStep,
          mode: 'insensitive',
        };
      }

      if (department) {
        where.department = {
          equals: department,
          mode: 'insensitive',
        };
      }

      if (search) {
        where.OR = [
          { useCase: { contains: search, mode: 'insensitive' } },
          { conceptDescription: { contains: search, mode: 'insensitive' } },
          { benefit: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Execute queries in parallel
      const [useCases, total] = await Promise.all([
        prisma.useCase.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.useCase.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const response: PaginatedResponse<typeof useCases[number]> = {
        data: useCases,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        filters: {
          industry,
          valueChainStep,
          department,
          search,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/use-cases/filters - Get available filter options
app.get('/api/use-cases/filters', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [industries, valueChainSteps, departments] = await Promise.all([
      prisma.useCase.findMany({
        where: { industry: { not: null } },
        select: { industry: true },
        distinct: ['industry'],
        orderBy: { industry: 'asc' },
      }),
      prisma.useCase.findMany({
        where: { valueChainStep: { not: null } },
        select: { valueChainStep: true },
        distinct: ['valueChainStep'],
        orderBy: { valueChainStep: 'asc' },
      }),
      prisma.useCase.findMany({
        where: { department: { not: null } },
        select: { department: true },
        distinct: ['department'],
        orderBy: { department: 'asc' },
      }),
    ]);

    res.status(200).json({
      industries: industries.map((i) => i.industry).filter(Boolean),
      valueChainSteps: valueChainSteps.map((v) => v.valueChainStep).filter(Boolean),
      departments: departments.map((d) => d.department).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/use-cases/:id - Get a single use case by ID
app.get(
  '/api/use-cases/:id',
  idParamValidation,
  handleValidationErrors,
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      const useCase = await prisma.useCase.findUnique({
        where: { id },
      });

      if (!useCase) {
        throw new NotFoundError('UseCase', id);
      }

      res.status(200).json({ data: useCase });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/use-cases - Create a new use case (Protected by API Key)
app.post(
  '/api/use-cases',
  createUseCaseValidation,
  handleValidationErrors,
  async (req: Request<object, object, UseCaseCreateRequest>, res: Response, next: NextFunction) => {
    try {
      const {
        useCase,
        conceptDescription,
        concreteImplementation,
        benefit,
        industry,
        department,
        valueChainStep,
        url,
      } = req.body;

      // Check for duplicate use case name
      const existing = await prisma.useCase.findFirst({
        where: {
          useCase: {
            equals: useCase.trim(),
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw new AppError('A use case with this name already exists', 409);
      }

      const newUseCase = await prisma.useCase.create({
        data: {
          useCase: useCase.trim(),
          conceptDescription: conceptDescription.trim(),
          concreteImplementation: concreteImplementation?.trim() ?? null,
          benefit: benefit?.trim() ?? null,
          industry: industry?.trim() ?? null,
          department: department?.trim() ?? null,
          valueChainStep: valueChainStep?.trim() ?? null,
          url: url?.trim() ?? null,
        },
      });

      res.status(201).json({
        message: 'Use case created successfully',
        data: newUseCase,
      });
    } catch (error) {
      next(error);
    }
  }
);

// =============================================================================
// CENTRALIZED ERROR HANDLING MIDDLEWARE
// =============================================================================

// 404 Handler for unknown routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Route not found', 404));
});

// Global error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Log error details
  console.error('='.repeat(80));
  console.error(`[ERROR] ${new Date().toISOString()}`);
  console.error(`Message: ${error.message}`);
  if (process.env['NODE_ENV'] === 'development') {
    console.error(`Stack: ${error.stack}`);
  }
  console.error('='.repeat(80));

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'Duplicate entry: A record with this value already exists',
        code: 'DUPLICATE_ENTRY',
      });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Record not found',
        code: 'NOT_FOUND',
      });
      return;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      error: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Handle custom validation errors
  if (error instanceof ValidationAppError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.errors.map((e) => ({
        field: 'path' in e ? e.path : 'unknown',
        message: e.msg,
      })),
    });
    return;
  }

  // Handle custom application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.constructor.name.toUpperCase().replace('ERROR', '_ERROR'),
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: process.env['NODE_ENV'] === 'production'
      ? 'An unexpected error occurred'
      : error.message,
    code: 'INTERNAL_SERVER_ERROR',
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Start Express server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
      console.log(`🔐 API Key Protection: ${API_KEY ? 'Enabled' : 'Disabled'}`);
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await prisma.$disconnect();
  console.log('Database connection closed.');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
});

// Start the server
startServer();

