import {
  Component, AfterViewInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';
import { HeaderComponent } from './components/header/header.component';
import { ThreeBackgroundComponent } from './components/three-background/three-background.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ThreeBackgroundComponent],
  template: `
    <app-three-background></app-three-background>
    <app-header></app-header>
    <div class="contenido" #outlet>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .contenido { max-width: 1100px; margin: 0 auto; padding: 24px; position: relative; }
  `]
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('outlet') outletEl!: ElementRef<HTMLElement>;
  private sub!: Subscription;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        gsap.to(this.outletEl.nativeElement, {
          opacity: 0, y: -12, duration: 0.2, ease: 'power2.in'
        });
      }
      if (event instanceof NavigationEnd) {
        gsap.fromTo(
          this.outletEl.nativeElement,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
