import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../home/home').then((m) => m.Home),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('../user/categories/pages/category-list/category-list').then((m) => m.CategoryList),
  },
];
