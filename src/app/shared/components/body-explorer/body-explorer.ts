import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faRotateRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BodyZone, BODY_ZONES, BodyZoneConfig, ExplorationStore } from '../../../core/stores/exploration.store';
import { PreferencesStore } from '../../../core/stores/preferences.store';

@Component({
  selector: 'app-body-explorer',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FontAwesomeModule, RouterLink],
  templateUrl: './body-explorer.html',
  styleUrl: './body-explorer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyExplorer {
  explorationStore = inject(ExplorationStore);
  private preferencesStore = inject(PreferencesStore);
  private translocoService = inject(TranslocoService);
  private router = inject(Router);

  mini = input(false);

  @HostBinding('class.body-explorer-host') get hostClass() {
    return true;
  }

  @HostBinding('class.body-explorer-host--mini') get isMini() {
    return this.mini();
  }

  hoveredZone = signal<BodyZone | null>(null);
  selectedZone = signal<BodyZone>('torso');

  activeLang = this.preferencesStore.language;
  zones: BodyZoneConfig[] = BODY_ZONES;

  icons = {
    arrow: faArrowRight,
    reset: faRotateRight,
    check: faCheck,
  };

  /** The currently focused zone (either hovered, or last selected) */
  activeZone = computed<BodyZone>(() => this.hoveredZone() ?? this.selectedZone());

  activeZoneConfig = computed<BodyZoneConfig>(() => {
    const currentId = this.activeZone();
    return this.zones.find((z) => z.id === currentId) ?? this.zones[1];
  });

  memoryText = computed(() => {
    const count = this.explorationStore.exploredCount();
    if (count === 5) {
      return this.translocoService.translate('home.discover.memoryAll');
    }
    const isAr = this.activeLang() === 'ar';
    return isAr
      ? `تم استكشاف ${count} من 5 مناطق`
      : `${count} of 5 Areas Explored`;
  });

  tooltipPosition = computed<Record<BodyZone, { x: number; y: number }>>(() => ({
    head: { x: 50, y: 7 },
    torso: { x: 50, y: 22 },
    arms: { x: 18, y: 32 },
    legs: { x: 50, y: 55 },
    feet: { x: 50, y: 88 },
  }));

  onZoneHover(zoneId: BodyZone | null): void {
    if (this.mini()) return;
    this.hoveredZone.set(zoneId);
  }

  onZoneSelect(zoneId: BodyZone): void {
    if (this.mini()) return;
    this.selectedZone.set(zoneId);
    this.hoveredZone.set(null);
  }

  onZoneClick(zoneId: BodyZone): void {
    if (this.mini()) return;

    this.explorationStore.markExplored(zoneId);
    this.selectedZone.set(zoneId);

    const zone = this.zones.find((z) => z.id === zoneId);
    if (!zone) return;

    const queryParams: Record<string, string> = {};
    if (zone.types.length > 0) {
      queryParams['type'] = zone.types[0];
    } else if (zone.category) {
      queryParams['category'] = zone.category;
    }

    this.router.navigate(['/shop'], { queryParams });
  }

  navigateToActiveZone(): void {
    this.onZoneClick(this.activeZone());
  }

  onResetExploration(event: Event): void {
    event.stopPropagation();
    this.explorationStore.reset();
  }
}
