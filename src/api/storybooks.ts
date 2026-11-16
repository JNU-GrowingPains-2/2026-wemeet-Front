import type { StoryReadiness, Storybook, StorybookOptions, StorybookSummary } from "../types";
import { request } from "./client";
import type { CreateStorybookInput, StorybookFeedbackInput } from "./types";

export const storybooksApi = {
  createStorybook: (childId: string, input: CreateStorybookInput) =>
    request<StorybookSummary>("POST", `/children/${childId}/storybooks`, { body: input }),
  listStorybooks: (childId: string) =>
    request<StorybookSummary[]>("GET", `/children/${childId}/storybooks`),
  getStorybook: (id: string) => request<Storybook>("GET", `/storybooks/${id}`),
  retryStorybook: (id: string) => request<StorybookSummary>("POST", `/storybooks/${id}/retry`),
  deleteStorybook: (id: string) => request<void>("DELETE", `/storybooks/${id}`),
  getStorybookOptions: () => request<StorybookOptions>("GET", "/storybook-options"),
  getStoryReadiness: (childId: string, periodStart: string, periodEnd: string) =>
    request<StoryReadiness>("GET", `/children/${childId}/storybooks/readiness`, {
      query: { period_start: periodStart, period_end: periodEnd },
    }),
  savePageAnswer: (id: string, pageNo: number, answer: string) =>
    request<Storybook>("PUT", `/storybooks/${id}/pages/${pageNo}/answer`, { body: { answer } }),
  makeNarration: (id: string, voice: string) =>
    request<Storybook>("POST", `/storybooks/${id}/narration`, { body: { voice } }),
  saveStorybookFeedback: (id: string, input: StorybookFeedbackInput) =>
    request<Storybook>("PUT", `/storybooks/${id}/feedback`, { body: input }),
  markStorybookRead: (id: string) =>
    request<{ readCount: number }>("POST", `/storybooks/${id}/read`),
};

export type StorybooksApi = typeof storybooksApi;
