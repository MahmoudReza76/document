import axios from "axios";

const BASE_URL = "https://api.ai-panels.com/api/docs";

/* -----------------------------
   1) Get Projects By Domain
------------------------------ */
export const getProjectsByDomain = async (domain) => {
  const response = await axios.get(`${BASE_URL}/projects`, {
    params: {domain}
  });

  return response?.data;
};

/* -----------------------------
   2) Get Menu
------------------------------ */
export const getMenu = async (domain, projectKey, lang) => {
  const response = await axios.get(`${BASE_URL}/menu`, {
    params: {domain, projectKey, lang}
  });
  return response?.data;
};

/* -----------------------------
   3) Get Page Content
------------------------------ */
export const getPage = async (domain, projectKey, category, slug, lang) => {
  const response = await axios.get(`${BASE_URL}/page`, {
    params: {domain, projectKey, category, slug, lang}
  });
  return response?.data;
};
