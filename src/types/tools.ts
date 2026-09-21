import React from 'react';

export type ToolCategoryId =
  | 'text'
  | 'image'
  | 'pdf'
  | 'qr'
  | 'calculator'
  | 'developer'
  | 'seo'
  | 'security'
  | 'datetime'
  | 'color'
  | 'converter'
  | 'grammar-content';

export interface ToolCategory {
  id: ToolCategoryId;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  gradient: string;
  badgeCount?: number;
}

export interface HowToUseStep {
  step: number;
  title: string;
  text: string;
}

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  category: ToolCategoryId;
  description: string;
  longDescription?: string;
  icon: string;
  keywords: string[];
  featured?: boolean;
  popular?: boolean;
  status: 'active' | 'beta' | 'coming-soon';
  component?: React.ComponentType;
  
  // SEO & Educational metadata
  seo: {
    title: string;
    description: string;
    canonical?: string;
  };
  howToUse: HowToUseStep[];
  features: string[];
  useCases: string[];
  faqs: ToolFaq[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  publishedDate: string;
  relatedToolSlugs: string[];
}
