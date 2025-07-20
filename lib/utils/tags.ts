import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PROJECT_NAME } from './constants';

export interface TaggingConfig {
  readonly environment: string;
  readonly projectName: string;
  readonly costCenter?: string;
  readonly owner?: string;
  readonly team?: string;
  readonly purpose?: string;
}

export class TaggingHelper {
  private readonly config: TaggingConfig;

  constructor(config: TaggingConfig) {
    this.config = config;
  }

  applyTags(construct: Construct, additionalTags?: Record<string, string>): void {
    const tags = {
      Environment: this.config.environment,
      Project: this.config.projectName,
      ...(this.config.costCenter && { CostCenter: this.config.costCenter }),
      ...(this.config.owner && { Owner: this.config.owner }),
      ...(this.config.team && { Team: this.config.team }),
      ...(this.config.purpose && { Purpose: this.config.purpose }),
      ...additionalTags
    };

    Object.entries(tags).forEach(([key, value]) => {
      cdk.Tags.of(construct).add(key, value);
    });
  }

  getCommonTags(): Record<string, string> {
    return {
      Environment: this.config.environment,
      Project: this.config.projectName,
      ...(this.config.costCenter && { CostCenter: this.config.costCenter }),
      ...(this.config.owner && { Owner: this.config.owner }),
      ...(this.config.team && { Team: this.config.team })
    };
  }
}

export function createTaggingHelper(environment: string): TaggingHelper {
  return new TaggingHelper({
    environment,
    projectName: PROJECT_NAME,
    costCenter: 'Development',
    owner: 'DevOps Team',
    team: 'Backend'
  });
}