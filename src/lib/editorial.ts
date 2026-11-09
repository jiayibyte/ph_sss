import { SITE } from '../../site.config';
import correctionRecords from '../data/editorial/corrections.json';

export const MAINTAINER = {
  name: 'AyTool maintainer',
  path: '/about/maintainer/',
  role: 'Website development, source-linked data maintenance and editorial corrections',
};
export const AUTHOR = {
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: `${SITE.url}${MAINTAINER.path}`,
};

export interface ProfessionalReview {
  name: string;
  profileUrl: string;
  qualification: string;
  reviewedOn: string;
  scope: string;
  pages: string[];
  evidenceUrl: string;
}

// Add only completed reviews with verifiable public evidence and permission to name the reviewer.
// Maintainer checks and automated tests are not independent professional reviews.
export const PROFESSIONAL_REVIEWS: ProfessionalReview[] = [];
export const reviewsFor = (pagePath: string) => PROFESSIONAL_REVIEWS.filter((r) => r.pages.includes(pagePath));
export const CORRECTIONS = correctionRecords;
export const correctionsFor = (pagePath: string) => CORRECTIONS.filter((c) => c.pages.includes(pagePath));

export const formatEditorialDate = (iso: string) => new Date(`${iso}T00:00:00+08:00`).toLocaleDateString('en-PH', {
  timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric',
});
