import { User } from './user.entity';
export declare class Post {
    id: number;
    title: string;
    content?: string;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
    userId: number;
    user: User;
}
