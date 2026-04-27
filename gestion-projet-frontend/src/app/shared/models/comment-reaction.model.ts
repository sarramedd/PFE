export type ReactionType = 'LIKE' | 'LOVE' | 'CLAP' | 'ROCKET' | 'THANKS';

export interface CommentReaction {
  id: number;
  reactionType: ReactionType;
  createdAt?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}
