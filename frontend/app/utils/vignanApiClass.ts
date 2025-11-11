import axios from 'axios';
import * as htmlparser2 from 'htmlparser2';
import * as domutils from 'domutils';
import { Element, Node, Text } from 'domhandler';
import { CookieJar } from 'tough-cookie';
import { Credentials } from './storage';

const DEFAULT_BASE_URL = 'https://ems.vignanlara.org';

export interface SubjectMarks {
  subjectCode: string;
  subjectName: string;
  assignment1: string;
  assignment2: string;
  midMarks: string;
  finalMarks: string;
}

class VignanApi {
  private baseUrl: string;
  private jar: CookieJar;
  private client: ReturnType<typeof axios.create>;

  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
    this.jar = new CookieJar();
    this.client = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true,
      timeout: 10000,
    });

    this.client.interceptors.request.use(async (config) => {
      const cookie = await this.jar.getCookieString(config.baseURL || this.baseUrl);
      if (cookie && config.headers) config.headers['Cookie'] = cookie;
      return config;
    });

    this.client.interceptors.response.use(async (response) => {
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        await Promise.all(
          setCookie.map((c: string) => this.jar.setCookie(c, response.config.url || this.baseUrl))
        );
      }
      return response;
    });
  }

  private extractHiddenFields(html: string) {
    const dom = htmlparser2.parseDocument(html);
    const get = (id: string) => domutils.getElementById(id, dom)?.attribs?.value || '';
    return {
      viewState: get('__VIEWSTATE'),
      viewStateGen: get('__VIEWSTATEGENERATOR'),
      eventValidation: get('__EVENTVALIDATION'),
    };
  }

  public async login(credentials: Credentials): Promise<boolean> {
    try {
      const loginPage = await this.client.get('/SBLogin.aspx');
      const { viewState, viewStateGen, eventValidation } = this.extractHiddenFields(loginPage.data);

      if (!viewState || !viewStateGen || !eventValidation) {
        console.error('❌ Missing form fields from login page.');
        return false;
      }

      const form = new URLSearchParams({
        '__VIEWSTATE': viewState,
        '__VIEWSTATEGENERATOR': viewStateGen,
        '__EVENTVALIDATION': eventValidation,
        'txtUserName': credentials.htno,
        'txtPassword': credentials.password ?? '',
        'btnSubmit': 'Login',
      }).toString();

      const res = await this.client.post('/SBLogin.aspx', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const dom = htmlparser2.parseDocument(res.data);
      const logoutLink = domutils.getElementById('Stud_Logout', dom);

      if (logoutLink) {
        console.log('✅ Logged in successfully');
        return true;
      }

      const errorSpan = domutils.getElementById('lblMessage', dom);
      if (errorSpan) console.error('Server message:', domutils.textContent(errorSpan), credentials);
      return false;
    } catch (err) {
      console.error('⚠️ Login failed:', err);
      return false;
    }
  }

  private async loadMarksPage() {
    const page = await this.client.get('/STUDENTLOGIN/Frm_TestMarks.aspx');
    return this.extractHiddenFields(page.data);
  }

  private parseMarks(html: string): SubjectMarks[] {
    const dom = htmlparser2.parseDocument(html);
    const rows = domutils.findAll(
      (el: Node) => {
        if (!domutils.isTag(el) || el.name !== 'tr') return false;
        const parent = domutils.getParent(el) as any;
        return parent && parent.attribs && parent.attribs.id === 'Stud_cpBody_gridSem1';
      },
      dom.children,
    ).slice(2);

    if (!rows.length) {
      return [
        { subjectCode: 'DUM1', subjectName: 'Parsing Failed - Dummy Subject 1', assignment1: '0', assignment2: '0', midMarks: '0', finalMarks: '25' },
        { subjectCode: 'DUM2', subjectName: 'Parsing Failed - Dummy Subject 2', assignment1: '0', assignment2: '0', midMarks: '0', finalMarks: '28' },
      ];
    }

    return rows.map((row) => {
      const tds = domutils.getChildren(row).filter(domutils.isTag);
      const getTdText = (index: number) => tds[index] ? domutils.textContent(tds[index] as Element | Text)?.trim() || '' : '';

      return {
        subjectCode: getTdText(1),
        subjectName: getTdText(2),
        assignment1: getTdText(3),
        assignment2: getTdText(4),
        midMarks: getTdText(5),
        finalMarks: getTdText(6),
      };
    });
  }

  public async getMidMarks(semNo: string, midNo: string): Promise<SubjectMarks[]> {
    try {
      const state = await this.loadMarksPage();

      const form = new URLSearchParams({
        '__VIEWSTATE': state.viewState,
        '__VIEWSTATEGENERATOR': state.viewStateGen,
        '__EVENTVALIDATION': state.eventValidation,
        'ctl00$Stud_cpBody$dSem': String(semNo),
        'ctl00$Stud_cpBody$dSubType': 'Theory',
        'ctl00$Stud_cpBody$dexamcode': String(midNo),
        'ctl00$Stud_cpBody$btnSearch': 'Show Data',
      }).toString();

      const res = await this.client.post('/STUDENTLOGIN/Frm_TestMarks.aspx', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return this.parseMarks(res.data);
    } catch (err) {
      console.error(`⚠️ Error fetching marks for sem ${semNo}, mid ${midNo}:`, err);
      return [{ subjectCode: 'ERR', subjectName: 'Network Error - Dummy Subject', assignment1: '0', assignment2: '0', midMarks: '0', finalMarks: '0' }];
    }
  }
}

const vignanApi = new VignanApi();
export default vignanApi;
export const login = vignanApi.login.bind(vignanApi);
export const getMidMarks = vignanApi.getMidMarks.bind(vignanApi);
