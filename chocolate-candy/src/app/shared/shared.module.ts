import { NgModule } from '@angular/core';

// This module previously attempted to export the standalone SideMenuComponent,
// which caused NG6004/NG6008 errors. Standalone components should be imported
// directly where used instead of being declared/exported via an NgModule.
// Keeping an empty module (in case of lingering imports) avoids build errors
// without changing usage elsewhere.
@NgModule({
  imports: [],
  exports: [],
  declarations: [],
})
export class SharedModule {}
