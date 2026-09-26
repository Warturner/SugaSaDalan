/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'media';
}

export type ContentType =
  | 'article'
  | 'publication';

export interface Story {
  post_id: number;
  title: string;
  author: string;
  content_type: ContentType;

  published_date: string;

  content: string;
  excerpt: string;

  image?: string;
  image_path?: string;

  category_id?: number | null;
  category_name?: string | null;

  is_pinned?: number;
  active_pin?: number;

  pin_until?: string | null;
}

export interface StoryAttachment {
  id: number;
  post_id?: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  uploaded_at?: string;
}

export interface StoryCategory {
  id: number;
  name: string;
}

export interface StoryEditHistory {
  edit_timestamp: string;
  username: string;
  changes_made: string;
}

export interface Donation {
  id: string;
  date: string;
  amount: number;
  category: ServiceCategory;
  donorName: string;
  status: 'Verified' | 'Pending';
  gateway: string;
}

export type ServiceCategory = 
  | 'Trauma Counseling' 
  | 'Educational Support' 
  | 'Emergency Relief' 
  | 'Community Outreach' 
  | 'Legal Assistance';

export type PaymentMethod = 'E-wallet' | 'Manual Bank Transfer' | 'Bank Card';

export type PublicPage = 'Home' | 'Mission' | 'Stories' | 'Donate' | 'Services' | 'Contact' | 'Login' | 'Team';
export type AdminTab = 'Stories' | 'Donations' | 'Reconciliation' | 'Accounts' | 'Settings' | 'Team';
 