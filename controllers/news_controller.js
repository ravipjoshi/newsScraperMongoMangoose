const cheerio = require("cheerio");
const request = require("request");
const db      = require("../models");

const getHeadline = selector => { 
  return {
    link:    selector.children("h2.story-heading").children("a").attr("href"),
    title:   selector.children("h2.story-heading").children("a").text(),
    summary: selector.children("p.summary").text(),
    byline:  selector.children("p.byline").text()
  }
};

const addHeadline = headline => 
  new Promise((resolve, reject) => {
    const query = { link: headline.link.trim(), title: headline.title.trim() };
    const update = headline;
    const options = { upsert: true, 
                      new: true, 
                      setDefaultsOnInsert: true, 
                      runValidators: true };

    db.News.findOneAndUpdate(query, update, options, (error, result) => 
      error ? reject(error) : resolve(result));
  });

const addHeadlines = headlines => 
  Promise.all(headlines.map(headline => addHeadline(headline)));

const renderHeadlines = (req, res, saved, count=0, full=false) => {
  db.News.find({ saved: saved })
  .then(results => {
    let renderObj = { headlines: results, scraped: count };
    if (!full) renderObj.layout = false;
    const renderFile = saved ? "saved" : "index";

    res.render(renderFile, renderObj);
  })
  .catch(error => res.json(error));
};

const countHeadlines = () => 
  new Promise((resolve, reject) => {
    db.News.count({ saved: false }, (error, result) => 
      error ? reject(error) : resolve(result));
  });

module.exports = app => {
  app.get("/", (req, res) => renderHeadlines(req, res, false, 0, true));

  app.get("/api/home", (req, res) => renderHeadlines(req, res, false, 0, false)); 

  app.get("/api/saved", (req, res) => renderHeadlines(req, res, true, 0, false));

  app.get("/api/scrape", (req, res) => {
    request("http://www.nytimes.com", (error, response, html) => {
      const $ = cheerio.load(html);

      let headlines = [];
      $("article.theme-summary", "div.a-column").each((i, element) => {
        const headline = getHeadline($(element));
        if (headline.title && headline.link) headlines.push(headline);
      })

      $("article.theme-summary", "div.b-column").each((i, element) => {
        const headline = getHeadline($(element));
        if (headline.title && headline.link) headlines.push(headline);
      });       

      let preCount = 0;

      countHeadlines()
      .then((count) => {
        preCount = count;
        return addHeadlines(headlines);
      })
      .then(() => countHeadlines())
      .then((count) => {
        const totalNew = count - preCount;
        renderHeadlines(req, res, false, totalNew, false);
      })
      .catch(error => res.json(error));
    });
  });

  app.get("/api/comments/:id", (req, res) => {
    const id = req.params.id;
    db.News.findById(id)
    .populate("comments")
    .then(results => {
      let renderObj = { id: id, comments: results.comments, layout: false };
      res.render("comments", renderObj);
    })
    .catch(error => res.json(error));
  });

  app.post("/api/comments/add/:id", (req, res) => {
    const id = req.params.id;
    const options = { new: true, 
                      runValidators: true };

    db.Comment.create(req.body)
    .then(results => 
      db.News.findByIdAndUpdate(id, {$push: { comments: results._id }}, options))
    .then(results => res.json(results))
    .catch(error => res.json(error));
  });

  app.put("/api/update", (req, res) => {
    const id = req.body.id;
    const update = { saved: req.body.saved };
    const options = { new: true, 
                      runValidators: true };

    db.News.findByIdAndUpdate(id, update, options)
    .then((error, result) => {
      let response = { id: id };

      error ? response.error = `Error occurred`
            : response.message = `Headline save status updated`;

      res.json(response);
    })
  });

  app.delete("/api/delete", (req, res) => {
    const id = req.body.id;

    db.News.findByIdAndRemove(id)
    .then((error, result) => { 
      let response = { id: id };

      error ? response.error = `Error occurred`
            : response.message = `Headline deleted`;

      res.json(response);
    });
  });

  app.delete("/api/comments/delete", (req, res) => {
    const id = req.body.id;

    db.Comment.findByIdAndRemove(id)
    .then((error, result) => { 
      let response = { id: id };

      error ? response.error = `Error occurred`
            : response.message = `Comment deleted`;

      res.json(response);
    });
  });
};
