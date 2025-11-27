import { UserContext, Goal } from './userContext';

export type ContextTemplate = {
  id: string;
  name: string;
  description: string;
  context: Partial<UserContext>;
};

export const CONTEXT_TEMPLATES: ContextTemplate[] = [
  {
    id: 'junior-developer',
    name: 'Junior Developer',
    description: 'For developers early in their career',
    context: {
      skillLevel: 'beginner',
      timeCapacity: 'flexible',
      learningStyle: 'hands-on',
      tone: 'friendly',
      preferences: {
        codeStyle: 'verbose',
        documentationLevel: 'extensive',
        comments: 'generous',
      },
      techStack: ['JavaScript', 'React', 'Node.js'],
      constraints: ['Learning new technologies', 'Following best practices'],
    },
  },
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    description: 'For entrepreneurs building their first product',
    context: {
      skillLevel: 'intermediate',
      timeCapacity: 'limited',
      learningStyle: 'conceptual',
      tone: 'concise',
      preferences: {
        codeStyle: 'minimal',
        documentationLevel: 'minimal',
        comments: 'sparse',
      },
      constraints: ['Limited time', 'Need quick wins', 'Budget constraints'],
      goals: [
        {
          title: 'Build MVP',
          description: 'Create a minimal viable product to validate the idea',
          status: 'in-progress',
          priority: 'high',
        },
      ] as Goal[],
    },
  },
  {
    id: 'enterprise-developer',
    name: 'Enterprise Developer',
    description: 'For developers working in large organizations',
    context: {
      skillLevel: 'advanced',
      timeCapacity: 'moderate',
      learningStyle: 'examples',
      tone: 'concise',
      preferences: {
        codeStyle: 'balanced',
        documentationLevel: 'moderate',
        comments: 'sparse',
      },
      techStack: ['TypeScript', 'React', 'Java', 'Python'],
      constraints: ['Code quality standards', 'Security requirements', 'Team collaboration'],
    },
  },
  {
    id: 'designer-learning-code',
    name: 'Designer Learning Code',
    description: 'For designers expanding into development',
    context: {
      skillLevel: 'beginner',
      timeCapacity: 'moderate',
      learningStyle: 'visual',
      tone: 'friendly',
      preferences: {
        codeStyle: 'verbose',
        documentationLevel: 'extensive',
        comments: 'generous',
      },
      techStack: ['HTML', 'CSS', 'JavaScript'],
      goals: [
        {
          title: 'Learn Frontend Development',
          description: 'Build interactive designs and prototypes',
          status: 'in-progress',
          priority: 'high',
        },
      ] as Goal[],
    },
  },
  {
    id: 'senior-engineer',
    name: 'Senior Engineer',
    description: 'For experienced engineers leading projects',
    context: {
      skillLevel: 'expert',
      timeCapacity: 'moderate',
      learningStyle: 'conceptual',
      tone: 'blunt',
      preferences: {
        codeStyle: 'minimal',
        documentationLevel: 'moderate',
        comments: 'sparse',
      },
      techStack: [],
      constraints: ['Technical debt', 'Performance requirements', 'Team mentoring'],
    },
  },
];

export function getTemplateById(id: string): ContextTemplate | undefined {
  return CONTEXT_TEMPLATES.find(t => t.id === id);
}

export function applyTemplate(template: ContextTemplate, existingContext?: Partial<UserContext>): Partial<UserContext> {
  // Merge template with existing context, template takes precedence for overlapping fields
  return {
    ...existingContext,
    ...template.context,
    // Merge arrays
    techStack: [...(existingContext?.techStack || []), ...(template.context.techStack || [])].filter((v, i, a) => a.indexOf(v) === i),
    goals: [...(existingContext?.goals || []), ...(template.context.goals || [])],
    constraints: [...(existingContext?.constraints || []), ...(template.context.constraints || [])].filter((v, i, a) => a.indexOf(v) === i),
    // Merge preferences object
    preferences: {
      ...existingContext?.preferences,
      ...template.context.preferences,
    },
  };
}

