import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '../../../core/services/notification.service';
import { WardrobeStore } from '../../../core/stores/wardrobe.store';
import { ClothingType, WardrobeItem } from '../../../core/models/iwardrobe';
import { SkeletonLoader } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { WardrobeShelfComponent } from './components/wardrobe-shelf/wardrobe-shelf.component';
import { WardrobeEmptyStateComponent } from './components/wardrobe-empty-state/wardrobe-empty-state.component';
import { WardrobeAddDialogComponent } from './components/wardrobe-add-dialog/wardrobe-add-dialog.component';
import { WardrobeItemDetailComponent } from './components/wardrobe-item-detail/wardrobe-item-detail.component';
import { AuthStore } from '../../auth/auth.store';

@Component({
  selector: 'app-wardrobe-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslocoModule,
    SkeletonLoader,
    WardrobeShelfComponent,
    WardrobeEmptyStateComponent,
    WardrobeAddDialogComponent,
    WardrobeItemDetailComponent,
  ],
  templateUrl: './wardrobe-page.component.html',
  styleUrl: './wardrobe-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobePageComponent implements OnInit {
  wardrobeStore = inject(WardrobeStore);
  authStore = inject(AuthStore);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);

  showAddDialog = signal(false);
  preselectedType = signal<ClothingType | null>(null);
  selectedItem = signal<WardrobeItem | null>(null);

  ngOnInit(): void {
    this.wardrobeStore.load(this.authStore.user()?.id);
  }

  openAddDialog(clothingType?: ClothingType): void {
    this.preselectedType.set(clothingType ?? null);
    this.showAddDialog.set(true);
  }

  closeAddDialog(): void {
    this.showAddDialog.set(false);
    this.preselectedType.set(null);
  }

  onItemAdded(): void {
    this.closeAddDialog();
  }

  openItemDetail(item: WardrobeItem): void {
    this.selectedItem.set(item);
  }

  closeItemDetail(): void {
    this.selectedItem.set(null);
  }

  updateItem(event: { id: string; changes: Partial<WardrobeItem> }): void {
    this.wardrobeStore.updateItem(event.id, event.changes);
    this.notificationService.success(
      this.translocoService.translate('wardrobe.updatedSuccessfully'),
    );
  }

  removeItem(id: string): void {
    this.wardrobeStore.removeItem(id);
    this.selectedItem.set(null);
    this.notificationService.info(
      this.translocoService.translate('wardrobe.removedSuccessfully'),
    );
  }
}
