const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const _ = require("lodash");

async function scrapeJobData(url) {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const html = await page.content();
    const $ = cheerio.load(html);

    const jobListings = [];
    $(".job-listing").each((i, element) => {
      const jobTitle = $(element).find(".job-title").text().trim();
      const skills = $(element).find(".job-skills").text().trim().split(",");
      const industry = $(element).find(".job-industry").text().trim();
      const location = $(element).find(".job-location").text().trim();

      jobListings.push({
        jobTitle,
        skills,
        industry,
        location,
      });
    });

    return jobListings;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function analyzeJobData(jobData) {
  const allSkills = _.flatMap(jobData, "skills");
  const skillCounts = _.countBy(allSkills);
  const topSkills = _.orderBy(_.toPairs(skillCounts), 1, "desc").slice(0, 10);

  console.log("Top Skills:", topSkills);
  // Perform further analysis and visualization...
}

async function main() {
  const jobUrls = [
    "https://www.linkedin.com/jobs/search/?keywords=software%20engineer",
    "https://www.indeed.com/jobs?q=data%20scientist",
    "https://www.glassdoor.com/Job/jobs.htm?sc.keyword=web%20developer",
  ];

  const scrapePromises = jobUrls.map(scrapeJobData);
  const scrapedData = await Promise.all(scrapePromises);

  const allJobData = _.flatten(scrapedData);
  await analyzeJobData(allJobData);
}

main();
