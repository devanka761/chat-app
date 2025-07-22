import "./sass/404.scss"

const canvas = <HTMLCanvasElement>document.querySelector(".icon")
const ctx = <CanvasRenderingContext2D>canvas.getContext("2d")
const grid = 96
const frames = [
  [0, 2],
  [1, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 2],
  [6, 2],
  [7, 2],
  [8, 2],
  [7, 2],
  [2, 2],
  [3, 2],
  [4, 2],
  [5, 2],
  [6, 2],
  [7, 2],
  [8, 2],
  [9, 2]
]

let currframe: number = 0
function spriteImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = "/assets/dvnkzkulonicon.png"
  })
}
function draw(img: HTMLImageElement): void {
  const [x, y] = frames[currframe]
  currframe++
  if (currframe >= frames.length) currframe = 0
  ctx.clearRect(0, 0, grid, grid)
  ctx.drawImage(img, grid * x, grid * y, grid, grid, 0, 0, grid, grid)
}
async function renderImage(): Promise<void> {
  const img = await spriteImage()
  setInterval(() => {
    draw(img)
  }, 100)
}

window.onload = () => {
  renderImage()
}
