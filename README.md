# 🏛️ Legal Precedent Analysis System

A modern, AI-powered legal research platform built with Next.js 15, featuring advanced precedent search, constitutional analysis, and bias detection capabilities.

## ✨ Features

### 🔍 Legal Research & Analysis
- **Precedent Browser**: Advanced search and filtering of legal precedents with AI-powered similarity analysis
- **Constitution Search**: Full-text search through the Indian Constitution with intelligent article matching
- **Case Analysis**: AI-powered legal document analysis with judgment prediction
- **Bias Detection**: Advanced algorithms to identify potential biases in legal documents

### 🤖 AI-Powered Capabilities
- **RAG (Retrieval-Augmented Generation)**: Intelligent document analysis using Z.ai SDK
- **Similarity Visualization**: Interactive charts showing precedent relationships
- **Real-time Analysis Dashboard**: Live monitoring of legal analysis processes
- **Confidence Scoring**: Quantified assessment of legal predictions

### 🗄️ Database & Data Management
- **Prisma ORM**: Type-safe database operations with SQLite
- **Seeded Database**: Pre-loaded with sample legal precedents and constitutional data
- **Advanced Search**: Full-text search with filtering capabilities
- **Data Privacy**: Built-in security measures for sensitive legal information

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS 4
- **shadcn/ui Components**: Modern, accessible UI components
- **Dark/Light Mode**: Theme switching with next-themes
- **Interactive Visualizations**: Charts and graphs for legal data analysis

### 🔧 Technical Features
- **Real-time Communication**: WebSocket support for live updates
- **API-first Architecture**: RESTful endpoints for all functionality
- **TypeScript**: Full type safety throughout the application
- **Authentication Ready**: NextAuth.js integration for user management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd legal-precedent-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample data
npm run db:seed
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── search-precedents/    # Precedent search API
│   │   ├── constitution/         # Constitution search API
│   │   ├── rag-query/           # RAG analysis API
│   │   ├── bias-detection/      # Bias detection API
│   │   └── analyze-case/        # Case analysis API
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── precedent-browser/       # Precedent search UI
│   ├── constitution-search/      # Constitution search UI
│   └── dashboard/               # Analysis dashboards
├── hooks/                       # Custom React hooks
└── lib/                         # Utilities and services
    ├── db.ts                    # Database connection
    ├── services/                # Business logic services
    └── utils.ts                 # Utility functions
```

## 🗄️ Database Schema

### Precedent Model
```sql
model Precedent {
  id          String   @id @default(cuid())
  title       String
  content     String
  caseNumber  String?
  court       String?
  date        DateTime?
  category    String?
  tags        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("precedents")
}
```

### Key Features
- Full-text search on precedent content
- Filtering by court, date, category, and tags
- AI-powered similarity analysis
- Constitutional article cross-references

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database
npm run db:seed      # Seed database with sample data
```

## 🌐 API Endpoints

### Precedent Search
- `GET /api/search-precedents` - Search and filter legal precedents
- Query parameters: `q`, `court`, `category`, `dateFrom`, `dateTo`

### Constitution Search
- `POST /api/constitution/search` - Search through constitutional articles
- `POST /api/constitution/load` - Load constitutional data

### AI Analysis
- `POST /api/rag-query` - RAG-based document analysis
- `POST /api/bias-detection` - Detect biases in legal text
- `POST /api/analyze-case` - Analyze legal cases with AI

### System
- `GET /api/health` - Health check endpoint
- `POST /api/seed` - Seed database with sample data

## 🚀 Deployment

### Development Deployment
```bash
# Start development server
npm run dev

# View logs
tail -f dev.log
```

### Production Deployment

#### 1. Build the Application
```bash
# Build for production
npm run build

# Start production server
npm run start

# View logs
tail -f server.log
```

#### 2. Environment Variables
Create a `.env.local` file with the following variables:
```env
# Database
DATABASE_URL="file:./db/custom.db"

# AI Service (Z.ai)
ZAI_API_KEY="your-zai-api-key"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

#### 3. Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### 4. Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically on push

#### 5. Traditional Server Deployment
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Set up database
npm run db:push
npm run db:seed

# Start the server
npm start
```

## 🔒 Security Features

- **Data Privacy**: Built-in data anonymization and privacy controls
- **API Security**: Rate limiting and input validation
- **Authentication**: NextAuth.js integration ready
- **Database Security**: Encrypted connections and secure access patterns

## 🎯 Use Cases

### For Legal Professionals
- **Case Research**: Quickly find relevant precedents and constitutional articles
- **Document Analysis**: AI-powered analysis of legal documents
- **Bias Detection**: Identify potential biases in legal reasoning
- **Confidence Assessment**: Get quantified confidence scores for legal predictions

### For Law Students
- **Constitutional Study**: Interactive exploration of constitutional articles
- **Precedent Analysis**: Understand relationships between different cases
- **Research Assistance**: AI-powered help for legal research projects

### For Legal Institutions
- **Knowledge Management**: Centralized repository of legal precedents
- **Quality Control**: Bias detection and confidence scoring
- **Training Tool**: Educational platform for legal research

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api-docs`

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced visualization tools
- [ ] Integration with external legal databases
- [ ] Collaborative research features
- [ ] Mobile application
- [ ] Advanced reporting and analytics

---

Built with ❤️ for the legal community. Powered by Next.js 15, Z.ai SDK, and modern web technologies.