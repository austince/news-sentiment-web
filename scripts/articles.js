function fbStatDateBinSearch(arr, searchDate) {

    var minIndex = 0;
    var maxIndex = arr.length - 1;
    var currentIndex;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;

        if (arr[currentIndex].date < searchDate) {
            minIndex = currentIndex + 1;
        }
        else if (arr[currentIndex].date > searchDate) {
            maxIndex = currentIndex - 1;
        }
        else {
            // Found exactly
            return currentIndex;
        }
    }
    return currentIndex;
}

/**
 * Created by austin on 4/21/16.
 */
function FbStat(data) {
    this.date = new Date(data.date.$date);
    this.clickCount = data.clickCount;
    this.commentCount = data.commentCount;
    this.likeCount = data.likeCount;
    this.shareCount = data.shareCount;
    this.totalCount = data.totalCount;
}

function TextAnalysis(data) {
    this.neg = data.neg;
    this.neutral = data.neutral;
    this.pos = data.pos;
    this.terms = data.terms;
}

function Article(data) {
    this.id = data._id.$oid;
    this.date = new Date(data.date.$date);
    this.fbIsAnalyzed = data.fbIsAnalyzed;

    this.textAnalysis = new TextAnalysis(data.textAnalysis);
    this.newsEdition = data.newsEdition;
    this.title = data.title;
    this.url = data.url;
    this.site = data.site;

    this.relatedArticles = data.relatedArticles;
    for (var i = 0; i < this.relatedArticles.length; i++) {
        this.relatedArticles[i] = this.relatedArticles[i].$oid;
    }

    // Array of stats
    this.fbStats = [];
    for (var i = 0; i < data.fbStats.length; i++) {
        this.fbStats.push(new FbStat(data.fbStats[i]));
    }
}

Article.prototype.getTotalInteraction = function() {
    return this.fbStats[this.fbStats.length - 1].totalCount;
};

Article.prototype.getInteractionBefore = function(date) {
    var lastStat = this.fbStats[fbStatDateBinSearch(this.fbStats, date)];
    return lastStat.totalCount;
};

/**
 * Normalizes the sentiment
 * Neutral matters least
 */
Article.prototype.getWeightedSentiment = function() {
    var neuConst = 100 - this.textAnalysis.neutral;
    var total = this.textAnalysis.neutral + this.textAnalysis.pos*neuConst - this.textAnalysis.neg*neuConst;
    if (total > 100) total = 100;
    if (total < 0) total = 0;

   return total;
};