// src/types/index.ts

export type Subtask = {
	id: string;
	text: string;
	checked: boolean;
};

export type Task = {
	id: string;
	title: string;
	subtasks?: Subtask[];
	isRunning: boolean;
	isDone: boolean;
	createdAt: string; // ISO date string
	completedAt?: string; // ISO date string
};

export type Summary = {
	date: string; // YYYY-MM-DD
	completedTasks: number;
};
