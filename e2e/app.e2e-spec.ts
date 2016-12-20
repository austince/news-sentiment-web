import { NewsSentimentPage } from './app.po';

describe('news-sentiment App', function() {
  let page: NewsSentimentPage;

  beforeEach(() => {
    page = new NewsSentimentPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
