import site from "../../extends/site";

const defaultSite = {
  title: "",
  logo: require("@/assets/images/yslogo.png")
};

const mix = Object.assign({}, defaultSite, site);

export default mix;
