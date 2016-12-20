import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import './rxjs-extensions';

import { AppComponent } from './app.component';
import { NewsWebComponent } from './news-web/news-web.component';
import { ArticleService } from './article.service';

@NgModule({
  declarations: [
    AppComponent,
    NewsWebComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [ArticleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
