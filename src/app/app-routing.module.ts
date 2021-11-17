import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.page.module').then(m => m.AboutPageModule)
  },
  {
    path: 'start',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'guide-categories',
    loadChildren: () => import('./categories-list/categories-list.module').then(m => m.CategoriesListModule)
  },
  {
    path: 'guides/:guideCategoryId',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  {
    path: 'guide/:guideId',
    loadChildren: () => import('./guide/guide.module').then(m => m.GuidePageModule)
  },
  {
    path: 'guide/:guideId/:parentCollectionId',
    loadChildren: () => import('./guide/guide.module').then(m => m.GuidePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('./feedback/feedback.page.module').then(m => m.FeedbackPageModule)
  },
  {
    path: ':reference_model_alias/:reference_id/feedback',
    loadChildren: () => import('./feedback/feedback.page.module').then(m => m.FeedbackPageModule)
  },
  /// add/edit feedback
  {
    path: 'feedback/save',
    loadChildren: () => import('./feedback-add-edit/feedback-add-edit.module').then(m => m.FeedbackAddEditModule)
  },
  {
    path: ':reference_model_alias/:reference_id/feedback/save',
    loadChildren: () => import('./feedback-add-edit/feedback-add-edit.module').then(m => m.FeedbackAddEditModule)
  },
  {
    path: 'feedback/save/:feedbackId',
    loadChildren: () => import('./feedback-add-edit/feedback-add-edit.module').then(m => m.FeedbackAddEditModule)
  },
  {
    path: ':reference_model_alias/:reference_id/feedback/save/:feedbackId',
    loadChildren: () => import('./feedback-add-edit/feedback-add-edit.module').then(m => m.FeedbackAddEditModule)
  },
  {
    path: 'protocol/save/:protocolId',
    loadChildren: () => import('./protocol-add-edit/protocol-add-edit.module').then(m => m.ProtocolAddEditModule)
  },
  {
    path: 'protocol/save',
    loadChildren: () => import('./protocol-add-edit/protocol-add-edit.module').then(m => m.ProtocolAddEditModule)
  },
  {
    path: 'protocol',
    loadChildren: () => import('./protocol/protocol.page.module').then(m => m.ProtocolPageModule)
  },
  {
    path: 'guide-collection/:guideId',
    loadChildren: () => import('./guide-collection/guide-collection.page.module').then(m => m.GuideCollectionModule)
  },
  {
    path: 'guider_protocol_template/:templateId',
    loadChildren: () => import('./protocol/protocol.page.module').then(m => m.ProtocolPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'logout',
    loadChildren: () => import('./logout/logout.module').then(m => m.LogoutPageModule)
  },
  {
    path: 'guidecapture',
    loadChildren: () => import('./guidecapture/guidecapture.module').then(m => m.GuidecapturePageModule)
  },
  {
    path: 'editguide',
    loadChildren: () => import('./editguide/editguide.module').then(m => m.EditguidePageModule)
  },
  {
    path: 'editguide',
    children: [
      {
        path: ':id',
        loadChildren: () => import('./editguide/editguide.module').then(m => m.EditguidePageModule)
      }
    ]
  },
  {
    path: 'guidestep-add-edit',
    loadChildren: () => import('./guidestep-add-edit/guidestep-add-edit.module').then(m => m.GuidestepAddEditPageModule)
  },  {
    path: 'logs',
    loadChildren: () => import('./logs/logs.module').then( m => m.LogsPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
