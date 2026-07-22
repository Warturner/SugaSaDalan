/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
export interface User {
  id: number;
  username: string;
}
export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
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

export type AdminTab = 'Stories' | 'Donations' | 'Reconciliation' | 'Settings';
export type PublicPage = 'Home' | 'Stories' | 'Donate' | 'Mission' | 'Services' | 'Contact' | 'Login';
