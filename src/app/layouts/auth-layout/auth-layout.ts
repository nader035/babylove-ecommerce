import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <main
      class="min-h-screen w-full flex flex-col items-center justify-center bg-brand-bg-light p-4"
    >
      <div class="w-full max-w-[450px] animate-fade-in">
        <div class="flex flex-col items-center justify-center gap-2 mb-4">
          <img
            src="assets/images/babyLoveLogo.svg"
            class="w-16 h-16 object-contain colored-bear-icon"
            alt="BabyLove Logo"
          />
          <div class="flex flex-col items-center justify-center translate-y-0.5">
            <span
              class="text-2xl font-black text-brand-primary uppercase tracking-wider leading-none"
            >
              BABYLOVE
            </span>
            <span class="text-[7px] text-brand-muted uppercase tracking-[0.35em] mt-1 font-bold">
              From Germany To Your Hand
            </span>
          </div>
        </div>

        <router-outlet></router-outlet>
      </div>
    </main>
  `,
})
export class AuthLayout {}
