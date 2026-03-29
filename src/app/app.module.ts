// Angular Imports
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// project import
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { SharedModule } from './theme/shared/shared.module';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLogoComponent } from './theme/layout/admin/nav-bar/nav-logo/nav-logo.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './theme/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavCollapseComponent } from './theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavItemComponent } from './theme/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { ToggleFullScreenDirective } from './theme/shared/full-screen/toggle-full-screen';
import { ConfigurationComponent } from './theme/layout/admin/configuration/configuration.component';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// third party
import { ToastrModule } from 'ngx-toastr';

// bootstrap import
import { NgbDropdownModule, NgbNavModule, NgbTooltipModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QuillModule } from 'ngx-quill';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { authInterceptor } from './interceptors/auth.interceptor';
import { handleOpenHoursInterceptor } from './interceptors/handle-open-hours.interceptor';
import { Printer } from '@awesome-cordova-plugins/printer/ngx';
import { CalculatorComponent } from "./demo/application/reusableComponents/calculator/calculator.component";
// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';

registerLocaleData(localeFr);


@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavBarComponent,
    ToggleFullScreenDirective,
    NavLeftComponent,
    NavRightComponent,
    NavigationComponent,
    NavLogoComponent,
    NavContentComponent,
    NavGroupComponent,
    NavCollapseComponent,
    ConfigurationComponent,
    NavItemComponent,
    GuestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
    QuillModule.forRoot(),
    SweetAlert2Module.forRoot(),
    CalculatorComponent
],
  providers: [
    // BluetoothSerial, // Ajoutez ceci ici
    Printer, // Ajoutez cette ligne
    { provide: LOCALE_ID, useValue: 'fr' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: authInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: handleOpenHoursInterceptor, multi: true }
    // { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
