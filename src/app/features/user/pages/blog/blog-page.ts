import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import { BlogService, Blog } from '../../../../core/services/blog.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FontAwesomeModule, RouterLink],
  templateUrl: './blog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage implements OnInit {
  private blogService = inject(BlogService);
  private preferencesStore = inject(PreferencesStore);
  
  icons = { calendar: faCalendar, arrow: faArrowRight, clock: faClock };

  blogs = signal<Blog[]>([]);
  activeLang = this.preferencesStore.language;
  isLoading = signal(true);

  ngOnInit() {
    this.blogService.getBlogs().subscribe({
      next: (data) => {
        this.blogs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
