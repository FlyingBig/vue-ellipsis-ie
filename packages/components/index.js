import TextEllipsis from "./textEllipsis";

let components = [TextEllipsis];
function install(vue) {
  components.map((component) => {
    vue.component(component.name, component);
  });
}
export { TextEllipsis };
export default install
