import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBookmark, faImages, faLayerGroup, faShirt } from '@fortawesome/free-solid-svg-icons';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '../../../core/services/notification.service';
import { WardrobeFilter, WardrobeStore } from '../../../core/stores/wardrobe.store';
import { SkeletonLoader } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { BodyExplorer } from '../../../shared/components/body-explorer/body-explorer';
import { WardrobeItemCardComponent } from './components/wardrobe-item-card/wardrobe-item-card.component';
import { WardrobeUploadPanelComponent } from './components/wardrobe-upload-panel/wardrobe-upload-panel.component';

@Component({
  selector: 'app-wardrobe-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FontAwesomeModule,
    TranslocoModule,
    SkeletonLoader,
    BodyExplorer,
    WardrobeItemCardComponent,
    WardrobeUploadPanelComponent,
  ],
  templateUrl: './wardrobe-page.component.html',
  styleUrl: './wardrobe-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobePageComponent implements OnInit {
  wardrobeStore = inject(WardrobeStore);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);

  filters: WardrobeFilter[] = ['all', 'product', 'upload'];

  icons = {
    all: faLayerGroup,
    product: faShirt,
    upload: faImages,
    empty: faBookmark,
  };

  ngOnInit(): void {
    this.wardrobeStore.load();
  }

  setFilter(filter: WardrobeFilter): void {
    this.wardrobeStore.setFilter(filter);
  }

  remove(id: string): void {
    this.wardrobeStore.remove(id);
    this.notificationService.info(this.translocoService.translate('wardrobe.removedSuccessfully'));
  }

  filterLabelKey(filter: WardrobeFilter): string {
    if (filter === 'product') {
      return 'wardrobe.products';
    }

    if (filter === 'upload') {
      return 'wardrobe.uploads';
    }

    return 'wardrobe.all';
  }

  filterCount(filter: WardrobeFilter): number {
    if (filter === 'product') {
      return this.wardrobeStore.productCount();
    }

    if (filter === 'upload') {
      return this.wardrobeStore.uploadedCount();
    }

    return this.wardrobeStore.count();
  }
}
