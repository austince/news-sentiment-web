import {Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import { environment } from '../environments/environment';
import {Article} from "./article";
import {Observable} from "rxjs";

@Injectable()
export class ArticleService {
  private articlesEndpoint = '/articles';

  constructor(private http: Http) { }

  getArticle(id: String): Promise<Article> {
    return this.http.get(`${environment.articleApiUrl}/${this.articlesEndpoint}/${id}`)
                    .concatMap(this.extractData)
                    .catch(this.handleError)
                    .toPromise();
  }

  getArticles(options?: Object): Observable<Article[]> {
    return this.http.get(`${environment.articleApiUrl}/${this.articlesEndpoint}`)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  private extractData(res: Response): Article[] {
    const ARTICLE_JSON = JSON.parse(res.json());
    return JSON.parse(ARTICLE_JSON.result);
  }

  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}

export const ARTICLES_PROM = new Promise((resolve, reject) => { resolve(environment.testdata || {}) });
export const ARTILCES_LINKED_PROM = new Promise((resolve, reject) => { resolve(environment.testdataLinked || {}) });
