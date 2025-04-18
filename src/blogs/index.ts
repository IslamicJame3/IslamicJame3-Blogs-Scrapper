import AboMusaBlogScrapper from "./abo-musa";
import AlkulifyBlogScrapper from "./alkulify";
import Altameme1BlogScrapper from "./altameme1";
import ModajanaBlogScrapper from "./modajana";
import MshmsdinBlogScrapper from "./mshmsdin";

export default [
  {
    name: "مقالات الشيخ أبو جعفر عبد الله بن فهد الخليفي",
    class: AlkulifyBlogScrapper,
  },
  {
    name: "مقالات أبو إسماعيل الروسي",
    class: AboMusaBlogScrapper,
  },
  {
    name: "مقالات الشيخ عبد الله التميمي",
    class: Altameme1BlogScrapper,
  },
  {
    name: "مقالات الشيخ محمد بن شمس الدين",
    class: MshmsdinBlogScrapper,
  },
  {
    name: "موقع المدجنة لكشف حقيقة طائفة المدجنة",
    class: ModajanaBlogScrapper,
  },
];
