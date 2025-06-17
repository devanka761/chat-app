import "./sass/app.scss"

import Init from "./main/init"

window.onload = () => {
  const init: Init = new Init()
  init.run()
}
