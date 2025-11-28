import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const coursesCollection = defineCollection({
	loader: glob({
		pattern: '**/index.mdx',
		base: './src/content/courses'
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		image: z.string().optional(),
		order: z.number().optional(),
	}),
});

const chaptersCollection = defineCollection({
	loader: glob({
		// Exclude index.mdx files - only match chapter files
		pattern: '**/[!index]*.mdx',
		base: './src/content/courses'
	}),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		chapterOrder: z.number(),
		course: z.string(),
		image: z.string().optional(),
	}),
});

export const collections = {
	courses: coursesCollection,
	chapters: chaptersCollection,
};
