import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCloudArrowUp, faImages } from '@fortawesome/free-solid-svg-icons';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '../../../../../core/services/notification.service';
import { WardrobeStore } from '../../../../../core/stores/wardrobe.store';

const MOCK_UPLOAD_IMAGES = [
  'assets/images/mock/wardrobe/outfit-1.svg',
  'assets/images/mock/wardrobe/outfit-2.svg',
];

@Component({
  selector: 'app-wardrobe-upload-panel',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslocoModule],
  templateUrl: './wardrobe-upload-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobeUploadPanelComponent implements OnDestroy {
  private wardrobeStore = inject(WardrobeStore);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);

  previewUrl = signal<string | null>(null);
  selectedFileName = signal('');
  title = signal('');
  note = signal('');
  mockImageIndex = signal(0);

  canSave = computed(() => !!this.previewUrl() && !this.wardrobeStore.loading());

  icons = {
    upload: faCloudArrowUp,
    images: faImages,
  };

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      input.value = '';
      this.notificationService.warning(this.translocoService.translate('wardrobe.invalidImage'));
      return;
    }

    this.revokePreviewUrl();
    this.previewUrl.set(URL.createObjectURL(file));
    this.selectedFileName.set(file.name);
  }

  save(fileInput: HTMLInputElement): void {
    if (!this.canSave()) {
      return;
    }

    const nextMockImage = MOCK_UPLOAD_IMAGES[this.mockImageIndex() % MOCK_UPLOAD_IMAGES.length];

    this.wardrobeStore.addMockUploadedImage({
      // TODO: Replace mock image URL with real multipart upload endpoint during backend integration.
      imageUrl: nextMockImage,
      title: this.title().trim() || undefined,
      note: this.note().trim() || undefined,
    });
    this.notificationService.success(this.translocoService.translate('wardrobe.savedSuccessfully'));
    this.mockImageIndex.update((index) => index + 1);
    this.reset(fileInput);
  }

  reset(fileInput: HTMLInputElement): void {
    this.revokePreviewUrl();
    this.previewUrl.set(null);
    this.selectedFileName.set('');
    this.title.set('');
    this.note.set('');
    fileInput.value = '';
  }

  private revokePreviewUrl(): void {
    const preview = this.previewUrl();

    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  }
}
