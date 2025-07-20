import { Construct } from 'constructs';
export interface TaggingConfig {
    readonly environment: string;
    readonly projectName: string;
    readonly costCenter?: string;
    readonly owner?: string;
    readonly team?: string;
    readonly purpose?: string;
}
export declare class TaggingHelper {
    private readonly config;
    constructor(config: TaggingConfig);
    applyTags(construct: Construct, additionalTags?: Record<string, string>): void;
    getCommonTags(): Record<string, string>;
}
export declare function createTaggingHelper(environment: string): TaggingHelper;
