import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './src/routers/user.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8909;

// Middlewares
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes);

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'CRUD API with Express & MongoDB',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://backend-69bu.onrender.com"
            : `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routers/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
