import { NextRequest, NextResponse } from 'next/server';

interface QuestionRequest {
  role: string;
  questionCount?: number;
  candidateLevel: 'junior' | 'mid' | 'senior';
  candidateSkills: string[];
  experience?: number;
}

interface Question {
  id: number;
  text: string;
  category: string;
  difficulty: 'junior' | 'mid' | 'senior';
}

// Question templates based on role and level
const questionTemplates = {
  junior: {
    'Software Engineer': [
      'Tell me about yourself and your programming background.',
      'What programming languages are you most comfortable with?',
      'Explain the difference between a stack and a queue.',
      'What is object-oriented programming?',
      'How do you debug a program that is not working?',
      'What is the difference between HTTP and HTTPS?',
      'Explain what an array is and when you would use it.',
      'What is version control and why is it important?',
      'Describe your experience with databases.',
      'How do you handle errors in your code?'
    ],
    'Frontend Developer': [
      'Tell me about your experience with HTML, CSS, and JavaScript.',
      'What is the DOM and how do you manipulate it?',
      'Explain the difference between var, let, and const in JavaScript.',
      'How do you make a website responsive?',
      'What CSS frameworks have you worked with?',
      'Explain what React components are.',
      'How do you handle user input validation?',
      'What is the difference between GET and POST requests?',
      'Describe your experience with CSS Grid or Flexbox.',
      'How do you optimize website performance?'
    ],
    'Backend Developer': [
      'Tell me about your experience with server-side programming.',
      'What is an API and how do you build one?',
      'Explain the difference between SQL and NoSQL databases.',
      'How do you handle authentication in web applications?',
      'What is middleware and when do you use it?',
      'Describe your experience with REST APIs.',
      'How do you handle errors in backend applications?',
      'What is database normalization?',
      'Explain the concept of MVC architecture.',
      'How do you secure a web application?'
    ]
  },
  mid: {
    'Software Engineer': [
      'Describe a challenging technical problem you solved recently.',
      'How do you approach system design for scalable applications?',
      'Explain the trade-offs between different data structures.',
      'How do you ensure code quality in your projects?',
      'Describe your experience with testing methodologies.',
      'How do you handle technical debt in legacy systems?',
      'Explain your approach to performance optimization.',
      'How do you mentor junior developers?',
      'Describe a time when you had to learn a new technology quickly.',
      'How do you handle conflicting requirements from stakeholders?'
    ],
    'Frontend Developer': [
      'How do you implement state management in complex applications?',
      'Explain your approach to component architecture.',
      'How do you handle performance optimization in React/Vue applications?',
      'Describe your experience with build tools and bundlers.',
      'How do you implement accessibility in web applications?',
      'Explain your testing strategy for frontend applications.',
      'How do you handle cross-browser compatibility issues?',
      'Describe your experience with Progressive Web Apps.',
      'How do you implement real-time features in web applications?',
      'Explain your approach to CSS architecture at scale.'
    ],
    'Backend Developer': [
      'How do you design scalable database schemas?',
      'Explain your approach to API versioning and documentation.',
      'How do you handle high-traffic scenarios in backend systems?',
      'Describe your experience with microservices architecture.',
      'How do you implement caching strategies?',
      'Explain your approach to monitoring and logging.',
      'How do you handle database migrations in production?',
      'Describe your experience with cloud platforms.',
      'How do you ensure data consistency in distributed systems?',
      'Explain your approach to API security and rate limiting.'
    ]
  },
  senior: {
    'Software Engineer': [
      'How do you approach technical leadership and decision-making?',
      'Describe your experience leading large-scale system migrations.',
      'How do you balance technical excellence with business requirements?',
      'Explain your approach to building and mentoring engineering teams.',
      'How do you handle architectural decisions for enterprise systems?',
      'Describe your experience with DevOps and CI/CD practices.',
      'How do you evaluate and introduce new technologies to your team?',
      'Explain your approach to technical roadmap planning.',
      'How do you handle performance issues in production systems?',
      'Describe your experience with cross-functional collaboration.'
    ],
    'Frontend Developer': [
      'How do you architect frontend applications for enterprise scale?',
      'Explain your approach to frontend performance at scale.',
      'How do you lead frontend technology decisions and standards?',
      'Describe your experience with micro-frontend architectures.',
      'How do you implement design systems across multiple products?',
      'Explain your approach to frontend monitoring and analytics.',
      'How do you handle complex state management in large applications?',
      'Describe your experience with frontend testing strategies.',
      'How do you ensure frontend security in enterprise applications?',
      'Explain your approach to frontend team leadership and mentoring.'
    ],
    'Backend Developer': [
      'How do you design systems for millions of users?',
      'Explain your approach to distributed systems architecture.',
      'How do you handle data consistency across multiple services?',
      'Describe your experience with high-availability system design.',
      'How do you approach capacity planning and scaling?',
      'Explain your strategy for disaster recovery and business continuity.',
      'How do you design event-driven architectures?',
      'Describe your experience with performance engineering.',
      'How do you handle complex data pipeline architectures?',
      'Explain your approach to technical debt management at scale.'
    ]
  }
};

// Default fallback questions
const defaultQuestions = [
  'Tell me about yourself and your background.',
  'Why are you interested in this role?',
  'What are your greatest strengths?',
  'Describe a challenging project you worked on.',
  'How do you handle working under pressure?',
  'Where do you see yourself in 5 years?',
  'What motivates you in your work?',
  'How do you stay updated with new technologies?',
  'Describe your ideal work environment.',
  'What questions do you have for us?'
];

function generateQuestions(role: string, level: 'junior' | 'mid' | 'senior', count: number = 10): Question[] {
  // Get role-specific questions or fallback to default
  const roleQuestions = questionTemplates[level]?.[role as keyof typeof questionTemplates[typeof level]] || defaultQuestions;
  
  // Shuffle and select questions
  const shuffled = [...roleQuestions].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, count);
  
  // If we don't have enough role-specific questions, fill with default ones
  if (selectedQuestions.length < count) {
    const remainingCount = count - selectedQuestions.length;
    const additionalQuestions = defaultQuestions
      .filter(q => !selectedQuestions.includes(q))
      .slice(0, remainingCount);
    selectedQuestions.push(...additionalQuestions);
  }
  
  // Format as Question objects
  return selectedQuestions.map((text, index) => ({
    id: index + 1,
    text,
    category: `${role} - ${level}`,
    difficulty: level
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json();
    const { role, candidateLevel, candidateSkills, questionCount = 10 } = body;
    
    if (!role || !candidateLevel) {
      return NextResponse.json(
        { error: 'Role and candidateLevel are required' },
        { status: 400 }
      );
    }
    
    const questions = generateQuestions(role, candidateLevel, questionCount);
    
    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        role,
        level: candidateLevel,
        skills: candidateSkills,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for testing
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'Software Engineer';
  const level = (searchParams.get('level') as 'junior' | 'mid' | 'senior') || 'junior';
  const count = parseInt(searchParams.get('count') || '10');
  
  const questions = generateQuestions(role, level, count);
  
  return NextResponse.json({
    success: true,
    questions,
    metadata: {
      role,
      level,
      generatedAt: new Date().toISOString()
    }
  });
}
