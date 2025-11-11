import axios from 'axios';
import * as htmlparser2 from 'htmlparser2';
import * as domutils from 'domutils';
import { Element, Node, Text } from 'domhandler'; // Import Element and Node types
import { CookieJar } from 'tough-cookie';
import { Credentials } from './storage';

const BASE_URL = 'https://ems.vignanlara.org';
const jar = new CookieJar();

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000, // avoid hanging requests
});

// attach cookies before requests
client.interceptors.request.use(async (config) => {
  const cookie = await jar.getCookieString(config.baseURL || BASE_URL);
  if (cookie) config.headers['Cookie'] = cookie;
  return config;
});

// save cookies after responses
client.interceptors.response.use(async (response) => {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    await Promise.all(
      setCookie.map((c) => jar.setCookie(c, response.config.url || BASE_URL))
    );
  }
  return response;
});

const extractHiddenFields = (html: string) => {
  const dom = htmlparser2.parseDocument(html);
  const get = (id: string) => domutils.getElementById(id, dom)?.attribs?.value || '';
  return {
    viewState: get('__VIEWSTATE'),
    viewStateGen: get('__VIEWSTATEGENERATOR'),
    eventValidation: get('__EVENTVALIDATION'),
  };
};

export async function login(credentials: Credentials): Promise<boolean> {
  try {
    const loginPage = await client.get('/SBLogin.aspx');
    const { viewState, viewStateGen, eventValidation } = extractHiddenFields(loginPage.data);

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

    const res = await client.post('/SBLogin.aspx', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const dom = htmlparser2.parseDocument(res.data);
    const logoutLink = domutils.getElementById('ctl00_lnlkb', dom);

    if (logoutLink) {
      console.log('✅ Logged in successfully');
      return true;
    }

    const errorSpan = domutils.getElementById('lblMessage', dom);
    if (errorSpan) console.error('Server message:', domutils.textContent(errorSpan));
    return false;
  } catch (err) {
    console.error('⚠️ Login failed:', err);
    return false;
  }
}

async function loadMarksPage() {
  const page = await client.get('/STUDENTLOGIN/Frm_TestMarks.aspx');
  return extractHiddenFields(page.data);
}

export interface SubjectMarks {
  subjectCode: string;
  subjectName: string;
  assignment1: string;
  assignment2: string;
  midMarks: string;
  finalMarks: string;
}

function parseMarks(html: string): SubjectMarks[] {
  const dom = htmlparser2.parseDocument(html);
  const rows = domutils.findAll(
    (el: Node) => domutils.isTag(el) && el.name === 'tr' && domutils.getParent(el)?.attribs?.id === 'Stud_cpBody_gridSem1',
    dom.children,
  ).slice(2);

  if (!rows.length) {
    // Return dummy data if parsing fails, to allow UI development.
    return [
      { subjectCode: 'DUM1', subjectName: 'Parsing Failed - Dummy Subject 1', assignment1: '0', assignment2: '0', midMarks: '0', finalMarks: '25' },
      { subjectCode: 'DUM2', subjectName: 'Parsing Failed - Dummy Subject 2', assignment1: '0', assignment2: '0', midMarks: '0', finalMarks: '28' },
    ];
  }

  return rows.map((row) => {
    const tds = domutils.getChildren(row).filter(domutils.isTag); // Filter for Tag elements
    
    // Ensure enough td elements exist before accessing
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

export async function getMidMarks(semNo: string, midNo: string): Promise<SubjectMarks[]> {
  try {
    const state = await loadMarksPage();

    const form = new URLSearchParams({
      '__VIEWSTATE': state.viewState,
      '__VIEWSTATEGENERATOR': state.viewStateGen,
      '__EVENTVALIDATION': state.eventValidation,
      'ctl00$Stud_cpBody$dSem': String(semNo),
      'ctl00$Stud_cpBody$dSubType': 'Theory',
      'ctl00$Stud_cpBody$dexamcode': String(midNo), // 1 for Mid-I, 2 for Mid-II
      'ctl00$Stud_cpBody$btnSearch': 'Show Data',
    }).toString();

    const res = await client.post('/STUDENTLOGIN/Frm_TestMarks.aspx', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return parseMarks(res.data);
  } catch (err) {
    console.error(`⚠️ Error fetching marks for sem ${semNo}, mid ${midNo}:`, err);
    return [{ subjectCode: 'ERR', subjectName: 'Network Error - Dummy Subject', assignment1: '0', assignment2: '0', midMarks: '0', finalMarks: '0' }];
  }
}
