const axios = require("axios");
const cheerio = require("cheerio");
const { wrapper } = require("axios-cookiejar-support");
const tough = require("tough-cookie");

class VignanInternals {
  constructor(userId, password) {
    this.userId = userId;
    this.password = password;
    this.baseUrl = "https://ems.vignanlara.org";
    this.jar = new tough.CookieJar();
    this.client = wrapper(axios.create({ jar: this.jar, withCredentials: true }));
  }

  async login() {
    const loginPage = await this.client.get(this.baseUrl + "/SBLogin.aspx");
    const $ = cheerio.load(loginPage.data);

    const data = new URLSearchParams({
      "__VIEWSTATE": $("#__VIEWSTATE").val(),
      "__VIEWSTATEGENERATOR": $("#__VIEWSTATEGENERATOR").val(),
      "__EVENTVALIDATION": $("#__EVENTVALIDATION").val(),
      "txtUserName": this.userId,
      "txtPassword": this.password,
      "btnSubmit": "Login"
    });

    await this.client.post(this.baseUrl + "/SBLogin.aspx", data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    console.log("✅ Logged in");
  }

  async _loadInternalMarksPage() {
    const page = await this.client.get(this.baseUrl + "/STUDENTLOGIN/Frm_TestMarks.aspx");
    const $ = cheerio.load(page.data);

    return {
      viewState: $("#__VIEWSTATE").val(),
      eventValidation: $("#__EVENTVALIDATION").val(),
      viewGenerator: $("#__VIEWSTATEGENERATOR").val()
    };
  }

  async getMidMarks(semNo, midNo) {
    // midNo mapping: 1 → MID-I, 2 → MID-II, 3 → Internal, etc.
    const state = await this._loadInternalMarksPage();

    const data = new URLSearchParams({
      "__VIEWSTATE": state.viewState,
      "__VIEWSTATEGENERATOR": state.viewGenerator,
      "__EVENTVALIDATION": state.eventValidation,
      "ctl00$Stud_cpBody$dSem": String(semNo),
      "ctl00$Stud_cpBody$dSubType": "Theory", 
      "ctl00$Stud_cpBody$dexamcode": String(midNo),
      "ctl00$Stud_cpBody$btnSearch": "Show Data"
    });

    const response = await this.client.post(
      this.baseUrl + "/STUDENTLOGIN/Frm_TestMarks.aspx",
      data,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return this._parseMarks(response.data);
  }

  _parseMarks(html) {
    const $ = cheerio.load(html);
    const rows = $("#Stud_cpBody_gridSem1 tr").slice(2); // skip header rows
    const list = [];

    rows.each((i, row) => {
      const tds = $(row).find("td");
      if (tds.length > 3) {
        list.push({
          subjectCode: $(tds[1]).text().trim(),
          subjectName: $(tds[2]).text().trim(),
          assignment3: $(tds[3]).text().trim(),
          assignment4: $(tds[4]).text().trim(),
          midMarks: $(tds[5]).text().trim(),
          finalMarks: $(tds[6]).text().trim()
        });
      }
    });

    return list;
  }
}

module.exports = VignanInternals;
