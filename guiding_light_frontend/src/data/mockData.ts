/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Story, Donation } from '../types';

export const MOCK_STORIES: Story[] = [
  {
    id: '1',
    title: 'A New Beginning for Maria',
    excerpt: 'How trauma counseling helped a young girl rediscover hope after a devastating storm.',
    content: 'Full story content goes here...',
    author: 'Elena Santos',
    date: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '2',
    title: 'Back to School Campaign 2024',
    excerpt: 'Streetlight successfully provided school supplies to over 200 children in the community.',
    content: 'Full story content goes here...',
    author: 'Mark Ramos',
    date: '2024-02-28',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: '3',
    title: 'Safe Haven Project Update',
    excerpt: 'Construction of our new community center is now 75% complete.',
    content: 'Full story content goes here...',
    author: 'Elena Santos',
    date: '2024-01-20',
    image: 'https://images.unsplash.com/photo-1541976590-71394168159b?auto=format&fit=crop&q=80&w=400',
  },
];

export const MOCK_DONATIONS: Donation[] = [
  {
    id: 'TXN-001',
    date: '2024-03-20',
    amount: 5000,
    category: 'Trauma Counseling',
    donorName: 'John Doe',
    status: 'Verified',
    gateway: 'GCash',
  },
  {
    id: 'TXN-002',
    date: '2024-03-19',
    amount: 2500,
    category: 'Educational Support',
    donorName: 'Anonymous Donor',
    status: 'Verified',
    gateway: 'Maya',
  },
  {
    id: 'TXN-003',
    date: '2024-03-18',
    amount: 10000,
    category: 'Emergency Relief',
    donorName: 'Anonymous Donor',
    status: 'Verified',
    gateway: 'Bank Card',
  },
  {
    id: 'TXN-004',
    date: '2024-03-21',
    amount: 1500,
    category: 'Community Outreach',
    donorName: 'Maria Clara',
    status: 'Pending',
    gateway: 'GCash',
  },
  {
    id: 'TXN-005',
    date: '2024-03-21',
    amount: 3000,
    category: 'Trauma Counseling',
    donorName: 'Jose Rizal',
    status: 'Pending',
    gateway: 'Maya',
  },
];

export const TOP_INDIVIDUAL_DONORS = [
  { name: 'Juan Dela Cruz', amount: 50000 },
  { name: 'Dr. Maria Santos', amount: 35000 },
  { name: 'Elena Guerrero', amount: 25000 },
  { name: 'Roberto Tan', amount: 20000 },
  { name: 'Anonymous', amount: 15000 },
];

export const TOP_ORG_DONORS = [
  { name: 'Cebu Tech Solutions Inc.', amount: 250000 },
  { name: 'Rotary Club of Metro Cebu', amount: 180000 },
  { name: 'Global Relief Foundation', amount: 150000 },
  { name: 'Local Gov Unit - CDO', amount: 100000 },
  { name: 'Sunshine Logistics', amount: 75000 },
];
