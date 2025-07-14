import { UserMode } from '@/styles/themes/userThemes';

export interface GPTAdapterConfig {
  userMode: UserMode;
  basePrompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AdaptedPrompt {
  prompt: string;
  systemMessage: string;
  userMessage: string;
  config: {
    maxTokens: number;
    temperature: number;
  };
}

export class UserModeGPTAdapter {
  private static readonly MODE_CONFIGS = {
    teen: {
      systemMessage: "You are a fun, engaging AI assistant that speaks like a friendly teenager. Use emojis, casual language, and keep things light and entertaining. Make complex topics easy to understand with relatable examples.",
      maxTokens: 500,
      temperature: 0.8,
      style: "casual-fun"
    },
    pro: {
      systemMessage: "You are a professional, analytical AI assistant. Provide comprehensive insights, use business terminology, and focus on actionable takeaways. Be thorough and detail-oriented.",
      maxTokens: 800,
      temperature: 0.3,
      style: "professional-analytical"
    },
    adhd: {
      systemMessage: "You are a clear, focused AI assistant designed for users with ADHD. Use simple language, bullet points, and short sentences. Break down complex information into digestible chunks.",
      maxTokens: 400,
      temperature: 0.5,
      style: "clear-focused"
    },
    default: {
      systemMessage: "You are a helpful AI assistant. Provide clear, accurate information in a balanced tone that works for most users.",
      maxTokens: 600,
      temperature: 0.6,
      style: "balanced-clear"
    }
  };

  static adaptPrompt(config: GPTAdapterConfig): AdaptedPrompt {
    const modeConfig = this.MODE_CONFIGS[config.userMode] || this.MODE_CONFIGS.default;
    
    // Adapt the base prompt based on user mode
    const adaptedPrompt = this.adaptPromptForMode(config.basePrompt, config.userMode);
    
    // Create system message with mode-specific instructions
    const systemMessage = this.buildSystemMessage(modeConfig.systemMessage, config.context);
    
    return {
      prompt: adaptedPrompt,
      systemMessage,
      userMessage: adaptedPrompt,
      config: {
        maxTokens: config.maxTokens || modeConfig.maxTokens,
        temperature: config.temperature || modeConfig.temperature
      }
    };
  }

  private static adaptPromptForMode(basePrompt: string, userMode: UserMode): string {
    switch (userMode) {
      case 'teen':
        return this.adaptForTeen(basePrompt);
      case 'pro':
        return this.adaptForPro(basePrompt);
      case 'adhd':
        return this.adaptForADHD(basePrompt);
      default:
        return basePrompt;
    }
  }

  private static adaptForTeen(prompt: string): string {
    return `Hey! ${prompt} 
    
    Please make it super fun and easy to understand! Use emojis and keep it casual. 😊
    
    If it's a summary, make it like you're explaining to a friend!`;
  }

  private static adaptForPro(prompt: string): string {
    return `${prompt}
    
    Please provide a comprehensive analysis with:
    - Key insights and takeaways
    - Business implications
    - Actionable recommendations
    - Detailed breakdown of important points`;
  }

  private static adaptForADHD(prompt: string): string {
    return `${prompt}
    
    Please provide a clear, focused response with:
    - Short, simple sentences
    - Bullet points for key information
    - Clear structure and organization
    - Easy-to-follow format`;
  }

  private static buildSystemMessage(baseSystemMessage: string, context?: string): string {
    let systemMessage = baseSystemMessage;
    
    if (context) {
      systemMessage += `\n\nContext: ${context}`;
    }
    
    return systemMessage;
  }

  static getModeStyle(userMode: UserMode): string {
    return this.MODE_CONFIGS[userMode]?.style || this.MODE_CONFIGS.default.style;
  }

  static getModeConfig(userMode: UserMode) {
    return this.MODE_CONFIGS[userMode] || this.MODE_CONFIGS.default;
  }

  // Helper method for summary-specific adaptations
  static adaptSummaryPrompt(videoTitle: string, userMode: UserMode): AdaptedPrompt {
    const basePrompt = `Summarize this video: "${videoTitle}"`;
    return this.adaptPrompt({
      userMode,
      basePrompt,
      context: "This is a YouTube video summary request"
    });
  }

  // Helper method for analysis-specific adaptations
  static adaptAnalysisPrompt(content: string, userMode: UserMode): AdaptedPrompt {
    const basePrompt = `Analyze this content: "${content}"`;
    return this.adaptPrompt({
      userMode,
      basePrompt,
      context: "This is a content analysis request"
    });
  }
} 