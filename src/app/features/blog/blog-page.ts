import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FontAwesomeModule],
  templateUrl: './blog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  icons = { calendar: faCalendar, arrow: faArrowRight, clock: faClock };

  posts = [
    {
      id: 1,
      title: 'The Evolution of Modern Tailoring',
      excerpt: 'From Savile Row to contemporary ateliers — how the art of tailoring is being reimagined for a new generation of discerning dressers.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop',
      date: 'Mar 28, 2026',
      readTime: '6 min read',
      category: 'Craftsmanship',
    },
    {
      id: 2,
      title: 'How to Style Linen: A Seasonal Guide',
      excerpt: 'Linen is the fabric of effortless elegance. Here\'s how to wear it from boardroom to beach without looking rumpled.',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop',
      date: 'Mar 22, 2026',
      readTime: '5 min read',
      category: 'Style Guide',
    },
    {
      id: 3,
      title: 'Building the Perfect Capsule Wardrobe',
      excerpt: '12 timeless pieces that form the foundation of a wardrobe that works for every occasion — curated by our styling team.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
      date: 'Mar 18, 2026',
      readTime: '7 min read',
      category: 'Editorial',
    },
    {
      id: 4,
      title: 'Japanese Selvedge Denim: A Deep Dive',
      excerpt: 'Inside the heritage mills of Okayama — where shuttle looms produce the world\'s most coveted denim, one yard at a time.',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop',
      date: 'Mar 14, 2026',
      readTime: '8 min read',
      category: 'Material',
    },
    {
      id: 5,
      title: 'The Case for Investing in Cashmere',
      excerpt: 'Grade-A Mongolian cashmere vs. fast fashion knits — why paying more per wear actually saves you money (and the planet).',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a66?w=800&auto=format&fit=crop',
      date: 'Mar 10, 2026',
      readTime: '4 min read',
      category: 'Sustainability',
    },
    {
      id: 6,
      title: 'Spring/Summer 2026: Our Seasonal Edit',
      excerpt: 'Earthy neutrals, relaxed silhouettes, and technical fabrics — a first look at what\'s defining the season ahead.',
      image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop',
      date: 'Mar 6, 2026',
      readTime: '5 min read',
      category: 'Seasonal',
    },
  ];
}
