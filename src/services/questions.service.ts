// src/services/questions.service.ts
export class QuestionsService {
  // Job title to question mapping
  private static readonly QUESTION_BANK = {
    // Customer Success questions
    "Customer Success Associate": [
      "Tell us about a time when you helped a customer achieve their goals.",
      "How would you handle a situation where a customer is considering canceling their subscription?",
      "Describe your approach to building long-term relationships with clients.",
      "What metrics do you think are most important for measuring customer success?",
    ],
    
    // Sales questions
    "Sales Representative": [
      "Walk us through your typical sales process from lead to close.",
      "Tell us about a challenging deal you've closed and how you overcame obstacles.",
      "How do you handle rejection and maintain motivation in sales?",
      "Describe a time when you exceeded your sales targets.",
    ],
    
    // Account Management questions
    "Account Manager": [
      "How do you prioritize your accounts and manage multiple client relationships?",
      "Tell us about a time when you turned around an unhappy client.",
      "Describe your approach to identifying upselling opportunities.",
      "How do you handle competing priorities from different clients?",
    ],
    
    // Business Development questions
    "Business Development": [
      "How do you identify and qualify new business opportunities?",
      "Tell us about a partnership or deal you've developed from scratch.",
      "Describe your approach to market research and competitive analysis.",
      "How do you build relationships with potential partners or clients?",
    ],
    
    // Customer Support questions
    "Customer Support": [
      "How do you handle an angry or frustrated customer?",
      "Tell us about a time when you went above and beyond for a customer.",
      "Describe your approach to troubleshooting technical issues.",
      "How do you ensure customer satisfaction while maintaining efficiency?",
    ],
  };

  // Generic questions for any role
  private static readonly GENERIC_QUESTIONS = [
    "Tell us about yourself and your professional background.",
    "What motivates you in your career and what are you looking for in your next role?",
    "Describe a challenging situation you faced at work and how you handled it.",
    "Where do you see yourself in 5 years?",
    "What are your greatest strengths and how do they apply to this type of role?",
    "Tell us about a time when you had to learn something new quickly.",
    "How do you handle working under pressure or tight deadlines?",
    "Describe a time when you had to work with a difficult team member.",
  ];

  static async getQuestionsByJobTitles(jobTitles: string[]): Promise<string[]> {
    const selectedQuestions: string[] = [];
    
    // Always include the first generic question
    selectedQuestions.push(this.GENERIC_QUESTIONS[0]);
    
    // Add role-specific questions
    for (const jobTitle of jobTitles) {
      const roleQuestions = this.QUESTION_BANK[jobTitle as keyof typeof this.QUESTION_BANK];
      if (roleQuestions) {
        // Add 1-2 role-specific questions
        selectedQuestions.push(roleQuestions[0]);
        if (roleQuestions.length > 1) {
          selectedQuestions.push(roleQuestions[1]);
        }
      }
    }
    
    // Fill remaining slots with generic questions
    const remainingSlots = 4 - selectedQuestions.length;
    for (let i = 1; i <= remainingSlots && i < this.GENERIC_QUESTIONS.length; i++) {
      selectedQuestions.push(this.GENERIC_QUESTIONS[i]);
    }
    
    // Ensure we always return exactly 4 questions
    return selectedQuestions.slice(0, 4);
  }
}