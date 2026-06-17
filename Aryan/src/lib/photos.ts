import data from "./photos.json";

export type Photo = { src: string; w: number; h: number };

export const photos = data as Photo[];
