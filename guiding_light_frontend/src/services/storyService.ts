import {
  Story,
  StoryDetail,
  StoryAttachment,
  StoryCategory,
  StoryEditHistory
} from '../types'; 

import { apiFetch } from './api';

export function getStories() {
  return apiFetch<Story[]>(
    'get_stories.php'
  );
}

export function getStory(
  postId: number
) {
  return apiFetch<{
    success: boolean;
    story: StoryDetail;
  }>(
    `get_story.php?id=${postId}`
  );
}

export function getCategories() {
  return apiFetch<StoryCategory[]>(
    'get_categories.php'
  );
}

export function getStoryAttachments(
  postId: number
) {
  return apiFetch<StoryAttachment[]>(
    `get_story_attachments.php?post_id=${postId}`
  );
}

export function getStoryHistory(
  postId: number
) {
  return apiFetch<StoryEditHistory[]>(
    `get_story_history.php?post_id=${postId}`
  );
}

export function deleteStory(
  postId: number
) {
  return apiFetch<{
    success: boolean;
  }>(
    'delete_story.php',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body: JSON.stringify({
        post_id: postId
      })
    }
  );
}

export function deleteAttachment(
  attachmentId: number
) {
  return apiFetch<{
    success: boolean;
  }>(
    'delete_attachments.php',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json'
      },
      body: JSON.stringify({
        id: attachmentId
      })
    }
  );
}

export function saveStory(
  formData: FormData,
  isEditing: boolean
) {

  const endpoint =
    isEditing
      ? 'update_story.php'
      : 'create_story.php';

  return apiFetch<{
    success: boolean;
    post_id?: number;
  }>(
    endpoint,
    {
      method: 'POST',
      body: formData
    }
  );
}