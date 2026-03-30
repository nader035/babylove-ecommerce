import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faLeaf, faGlobe, faHandshake } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule],
  templateUrl: './about-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  icons = { heart: faHeart, leaf: faLeaf, globe: faGlobe, handshake: faHandshake };

  team = [
    { name: 'Nader Mohamed', role: 'Head of Design & Front-end Developer', image: 'assets/images/nader.jpg' },
  ];

  values = [
    { icon: this.icons.heart, titleKey: 'about.values.quality', descKey: 'about.values.qualityDesc' },
    { icon: this.icons.leaf, titleKey: 'about.values.sustainability', descKey: 'about.values.sustainabilityDesc' },
    { icon: this.icons.globe, titleKey: 'about.values.community', descKey: 'about.values.communityDesc' },
    { icon: this.icons.handshake, titleKey: 'about.values.trust', descKey: 'about.values.trustDesc' },
  ];
}
