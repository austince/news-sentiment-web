import { Component, OnInit } from '@angular/core';
import {ArticleService} from "../article.service";
import {Article} from "../article";

@Component({
  selector: 'app-news-web',
  templateUrl: './news-web.component.html',
  styleUrls: ['./news-web.component.scss']
})
export class NewsWebComponent implements OnInit {

  constructor(private articleService: ArticleService) { }

  articles: Article[] = [];

  ngOnInit() {
    this.articleService.getArticles().subscribe(
      (articles) => articles.forEach(article => this.articles.push(article))
    );
  }

}
