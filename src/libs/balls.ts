/** 默认颜色变化数组 */
const _defaultColors = [
  [240, 91, 114, 3000],
  [49, 105, 146, 3000],
  [153, 47, 37, 3000],
  [120, 115, 201, 3000],
  [153, 105, 33, 3000],
  [70, 120, 33, 3000],
  [28, 110, 110, 3000],
  [75, 75, 120],
]

/** 设备像素比 */
const DPR = window.devicePixelRatio || 1

/** 小球类型 */
enum BALL_TYPE {
  /** 鼠标 */
  MOUSE_TYPE = -1,
  /** 实心球 */
  SOLID = 0,
  /** 圆环 */
  RING = 1,
  /** 双圆环 */
  DOUBLE_RING = 2,
}

/** 鼠标与小球的距离关系 */
enum WITH_MOUSE {
  /** 范围外 */
  OUTSIDE = 0,
  /** 范围内 */
  INSIDE = 1,
  /** 球中 */
  OVERLAP = 2,
}

/** 颜色变化对象 */
interface IColor {
  /** 当前颜色step */
  cur_i: number
  /** 当前颜色组索引 */
  cur_color: number
  /** 当前颜色 */
  color: number[]
  /** 每次渲染变化量 */
  changeValue: number
  /** 当前颜色范围 */
  ColorList: number[][]
  /** 渐变颜色组 */
  ColorGroup: number[][]
}

interface IBall extends IColor {
  /** x 坐标 */
  x: number
  /** y 坐标 */
  y: number
  /** 小球半径 */
  r: number
  /** 水平方向加速度 */
  vx: number
  /** 垂直方向加速度 */
  vy: number
  /** 透明度 */
  opacity: number
  /** 是否进入鼠标范围 */
  isInfect: boolean
  /** 小球类型 */
  type: BALL_TYPE
  /** 是否反向颜色渐变 */
  reverse: boolean
  /** 与鼠标位置的关系 */
  withMouse: WITH_MOUSE
  /** 中间空心的半径【圆环，双圆环】 */
  emptyR?: number
  /** 中心圆的半径【双圆环】 */
  sonR?: number
  /** 本体小球【只有镜像小球有】 */
  origin?: IBall
  /** 是否发生碰撞 */
  isCrash?: boolean
  /** 碰撞后的水平速度 */
  fx?: number
  /** 碰撞后的垂直速度 */
  fy?: number
}

/** 鼠标小球 */
interface IMouseBall extends IColor {
  /** x 坐标 */
  x: number
  /** y 坐标 */
  y: number
  /** 作用半径 */
  r: number
  /** 类型 */
  type: BALL_TYPE
  /** 是否抓住小球 */
  catchBall: boolean
}

export default class Balls {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  /** 宽度 */
  width!: number
  /** 高度 */
  height!: number
  /** 画布 rect */
  rect!: ClientRect
  /** 向外延伸出的镜像范围 */
  mirrorRange!: number
  /** 是否动画中 */
  isAnimate!: boolean

  /** 文本 */
  txt: string = 'NightCat'
  /** 文本样式 */
  font: string = 'normal normal 120px Nothing You Could Do'
  /** 底部文本 */
  bottomTxt: string = ' - press any key to enter - '
  /** 底部文本样式 */
  bottomFont: string = 'normal normal 24px Nothing You Could Do'
  /** 总个数 */
  ballCount: number = 30
  /** 连线的粗度 */
  lineWidth: number = 1
  /** 连线范围 */
  lineRange: number = 200
  /** 半径范围 */
  radiusRange: number[] = [10, 20]
  /** 小球颜色组 [[r, g, b, time]...] *time: 在该颜色停留的时间 */
  color: number[][] = _defaultColors
  /** 背景颜色组 */
  bgColor: number[][] = [[224, 224, 224, 10000], [22, 22, 22, 10000]]
  /** 文本颜色组 */
  textColor: number[][] = [[52, 52, 52, 10000], [224, 224, 224, 10000]]
  /** 鼠标颜色组 */
  mouseColor: number[][] = _defaultColors
  /** 颜色呼吸周期 */
  period: number = 5000
  /** 背景颜色呼吸周期 */
  bgPeriod: number = 5000
  /** 文本颜色呼吸周期 */
  textPeriod: number = 5000
  /** 透明度范围 */
  opacity: number[] = [0.3, 0.8]
  /** 速度范围 */
  speed: number[] = [-1, 1]
  /** 是否点击暂停 */
  clickPause: boolean = false

  /** 实体球数据 */
  private balls: IBall[] = []
  /** 镜像球数据 */
  private vBalls: IBall[] = []
  /** 鼠标数据 */
  private mouse!: IMouseBall
  /** 背景颜色数据 */
  private bg!: IColor
  /** 文本颜色数据 */
  private text!: IColor

  constructor(id: string) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    this.font = this.font.replace(
      /\d+(?=px)/,
      size => '' + parseFloat(size) * DPR,
    )
    this.lineWidth = this.lineWidth * DPR
    this.lineRange = this.lineRange * DPR
    this.radiusRange = this.radiusRange.map(radius => radius * DPR)
    this.speed = this.speed.map(speed => speed * DPR)

    this.mouse = {
      x: 0,
      y: 0,
      r: 0,
      type: BALL_TYPE.MOUSE_TYPE,
      catchBall: false,
      ...this.initGradientData(this.period, this.mouseColor),
    }
    this.bg = this.initGradientData(this.bgPeriod, this.bgColor)
    this.text = this.initGradientData(this.textPeriod, this.textColor)

    this.clickHandle = this.clickHandle.bind(this)
    this.mouseHandle = this.mouseHandle.bind(this)
    this.init = this.init.bind(this)
    this.bindEvent()
    this.init()
    this.start()
  }

  /** 初始化canvas */
  init() {
    this.width = this.canvas.width = this.canvas.offsetWidth * DPR
    this.height = this.canvas.height = this.canvas.offsetHeight * DPR
    this.rect = this.canvas.getBoundingClientRect() as ClientRect
    this.mirrorRange = Math.max(this.radiusRange[1] * 2, this.lineRange)
  }

  /** 绑定事件 */
  bindEvent() {
    this.canvas.addEventListener('click', this.clickHandle, false)
    this.canvas.addEventListener('mousemove', this.mouseHandle, false)
    window.addEventListener('resize', this.init, false)
  }

  /** 移除事件 */
  unbindEvent() {
    this.canvas.removeEventListener('click', this.clickHandle, false)
    this.canvas.removeEventListener('mousemove', this.mouseHandle, false)
    window.removeEventListener('resize', this.init, false)
  }

  /** 点击控制动画 */
  clickHandle(e: MouseEvent) {
    this.clickPause && this.toggleAnimateStatus()
  }

  /** 鼠标移动事件 */
  mouseHandle(e: MouseEvent) {
    let mx = e.clientX - this.rect.left
    let my = e.clientY - this.rect.top

    this.mouse.x = mx * DPR
    this.mouse.y = my * DPR
  }

  /** 动画开始 */
  start() {
    if (this.isAnimate) {
      return false
    }

    for (var i = this.vBalls.length; i < this.ballCount; i++) {
      this.addBall()
    }

    this.isAnimate = true

    const step = () => {
      if (!this.isAnimate) return false

      this.ctx.clearRect(0, 0, this.width, this.height)
      this.renderBackground()
      this.render()
      this.renderText()
      this.update()
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  /** 切换动画状态 */
  toggleAnimateStatus() {
    if (this.isAnimate) {
      this.isAnimate = false
    } else {
      this.start()
    }
  }

  /** 得到颜色渐变数组 */
  getColorList(color: number[][]): number[][] {
    // 颜色差值[r, g, b]
    let startColor = color[0]
    let endColor = color[1]

    let ColorDis = endColor.map((end, i) => end - startColor[i])

    // 颜色差最大的绝对值
    let ColorLength = Math.max(
      Math.abs(ColorDis[0]),
      Math.abs(ColorDis[1]),
      Math.abs(ColorDis[2]),
    )

    // 颜色变化系数
    let ColorChange = ColorDis.map(c => c / ColorLength)

    let ColorList: number[][] = []

    for (let i = 0; i < ColorLength; i++) {
      ColorList.push(ColorChange.map((c, index) => color[0][index] + c * i))
    }

    return ColorList
  }

  /** 增加一个球 */
  addBall(): void {
    let types = [BALL_TYPE.DOUBLE_RING, BALL_TYPE.RING, BALL_TYPE.SOLID]
    let ball: IBall = {
      x: 0,
      y: 0,
      r: 0,
      vx: this.getRandomNumber(this.speed), // 水平方向加速度
      vy: this.getRandomNumber(this.speed), // 垂直方向加速度
      opacity: this.getRandomNumber(this.opacity), // 透明度
      isInfect: false, // 是否进入鼠标范围
      type: types[types[~~(Math.random() * types.length)]], // 小球类型
      reverse: false, // 是否反向颜色渐变
      withMouse: 0, // 与鼠标位置的关系  [0:范围外, 1:范围内, 2:球中]
      ...this.initGradientData(this.period, this.color),
    }

    // 半径由透明度决定（越谈越大）
    ball.r =
      (1 - ball.opacity) * (this.radiusRange[1] - this.radiusRange[0]) +
      this.radiusRange[0]
    ball.x = this.getRandomNumber([ball.r, this.width - ball.r])
    ball.y = this.getRandomNumber([ball.r, this.height - ball.r])

    // 判断是否重合，重合则重新加
    if (this.isOverlap(ball)) {
      return this.addBall()
    }

    switch (ball.type) {
      case BALL_TYPE.SOLID:
        break
      case BALL_TYPE.RING:
        ball.emptyR = this.getRandomNumber([ball.r / 2, (ball.r / 4) * 3])
        break
      case BALL_TYPE.DOUBLE_RING:
        ball.emptyR = this.getRandomNumber([ball.r / 2, (ball.r / 4) * 3])
        ball.sonR = this.getRandomNumber([
          ball.emptyR / 2,
          (ball.emptyR / 4) * 3,
        ])
        break
    }

    this.vBalls.push(ball)
  }

  /** 判断该位置是否重叠 */
  isOverlap(ball: IBall) {
    return !this.vBalls.every(b => {
      let d = Math.sqrt(Math.pow(ball.x - b.x, 2) + Math.pow(ball.y - b.y, 2))
      if (d <= ball.r + b.r) {
        return false
      }
      return true
    })
  }

  /** 得到实体球和镜像球 */
  getBalls() {
    var ball = null
    var balls: IBall[] = []

    for (var i = 0, len = this.vBalls.length; i < len; i++) {
      ball = this.vBalls[i]
      balls.push(ball)
      balls = balls.concat(this.addMirrorBalls(ball))
    }

    return balls
  }

  /** 判断位置生成镜像球 */
  addMirrorBalls(ball: IBall): IBall[] {
    let balls: IBall[] = []
    const newPos: Partial<IBall> = {}
    if (ball.x < this.mirrorRange) {
      newPos.x = ball.x + this.width
    }
    if (ball.x > this.width - this.mirrorRange) {
      newPos.x = ball.x - this.width
    }
    if (ball.y < this.mirrorRange) {
      newPos.y = ball.y + this.height
    }
    if (ball.y > this.height - this.mirrorRange) {
      newPos.y = ball.y - this.height
    }

    if (newPos.x) {
      balls.push(this.addMirrorBall(ball, { x: newPos.x, origin: ball }))
    }
    if (newPos.y) {
      balls.push(this.addMirrorBall(ball, { y: newPos.y, origin: ball }))
    }
    if (newPos.x && newPos.y) {
      balls.push(
        this.addMirrorBall(ball, { x: newPos.x, y: newPos.y, origin: ball }),
      )
    }

    return balls
  }

  /** 添加一个镜像球 */
  addMirrorBall(ball: IBall, obj: Partial<IBall>): IBall {
    return Object.assign({}, ball, obj)
  }

  /** 渲染 */
  render() {
    this.balls.length = 0
    this.balls = this.getBalls()
    this.balls.forEach((ball, i) => {
      this.renderBall(ball, i)
    })
  }

  /** 渲染单个球 */
  renderBall(ball: IBall, i: number) {
    // 连线
    this.balls.forEach((b: IBall, index: number) => {
      if (index <= i) {
        return false
      }
      this.handleTwoBall(ball, b)
    })
    this.handleTwoBall(ball, this.mouse)

    // 画球【三种类型】
    if (ball.type === BALL_TYPE.SOLID) {
      this.renderTypeArc(
        ball.x,
        ball.y,
        ball.r,
        this.getRGBA(ball.color, ball.opacity),
      )
    } else if (ball.type === BALL_TYPE.RING) {
      this.renderTypeArc(
        ball.x,
        ball.y,
        ball.r,
        this.getRGBA(ball.color, ball.opacity),
        ball.emptyR,
      )
    } else if (ball.type === BALL_TYPE.DOUBLE_RING) {
      this.renderTypeArc(
        ball.x,
        ball.y,
        ball.r,
        this.getRGBA(ball.color, ball.opacity),
        ball.emptyR,
        ball.sonR,
      )
    }
  }

  /** 判断渲染两球之间的连线 */
  handleTwoBall(ball: IBall, b: IBall | IMouseBall) {
    // 判断是否是鼠标小球
    function isMouseBall(item: IBall | IMouseBall): item is IMouseBall {
      return item.type === BALL_TYPE.MOUSE_TYPE
    }
    // 得到距离
    let d = Math.sqrt(Math.pow(ball.x - b.x, 2) + Math.pow(ball.y - b.y, 2))

    // 在范围内且没有碰撞时
    if (d < this.lineRange && d > ball.r + b.r) {
      if (isMouseBall(b)) {
        ball.withMouse = WITH_MOUSE.INSIDE
        ball.isInfect = true
      }
      let opacity = 1 - d / this.lineRange
      let ballColor = this.getRGBA(ball.color, opacity)
      let bColor = this.getRGBA(b.color, opacity)

      this.ctx.save()

      let g = this.ctx.createLinearGradient(ball.x, ball.y, b.x, b.y)

      if (ball.type === BALL_TYPE.RING && ball.emptyR) {
        g.addColorStop(0, ballColor)
        g.addColorStop(ball.emptyR / d, ballColor)
        g.addColorStop(ball.emptyR / d, 'transparent')
      } else if (
        ball.type === BALL_TYPE.DOUBLE_RING &&
        ball.emptyR &&
        ball.sonR
      ) {
        g.addColorStop(0, 'transparent')
        g.addColorStop(ball.sonR / d, 'transparent')
        g.addColorStop(ball.sonR / d, ballColor)
        g.addColorStop(ball.emptyR / d, ballColor)
        g.addColorStop(ball.emptyR / d, 'transparent')
      } else {
        g.addColorStop(0, 'transparent')
      }
      g.addColorStop(ball.r / d, 'transparent')
      g.addColorStop(ball.r / d, ballColor)
      g.addColorStop(1 - b.r / d, bColor)
      g.addColorStop(1 - b.r / d, 'transparent')
      g.addColorStop(1, 'transparent')

      this.ctx.strokeStyle = g
      this.ctx.lineWidth = this.lineWidth
      this.renderLine(ball.x, ball.y, b.x, b.y)

      this.ctx.restore()
    }
    // 碰撞
    else if (d < ball.r + b.r && !ball.isCrash) {
      if (isMouseBall(b)) {
        ball.withMouse = WITH_MOUSE.OVERLAP
        ball.isInfect = true
        b.catchBall = true
      } else if (!b.isCrash) {
        ball.isCrash = true
        b.isCrash = true
        if (!isMouseBall(b)) {
          this.crashHandle(ball, b)
          if (ball.origin) {
            ball.origin.isCrash = true
          }
          if (b.origin) {
            b.origin.isCrash = true
          }
        }
      }
    }
    // 范围外
    else if (b.type === BALL_TYPE.MOUSE_TYPE) {
      ball.withMouse = WITH_MOUSE.OUTSIDE
      ball.isInfect = false
    }
  }

  /** 处理两球碰撞 */
  // 参考链接：http://www.jscon.co/coding/frontend/canvas_ball_collision.html
  crashHandle(b1: IBall, b2: IBall) {
    let deg = Math.atan2(b2.y - b1.y, b2.x - b1.x)
    let speed1 = Math.sqrt(b1.vx * b1.vx + b1.vy * b1.vy)
    let speed2 = Math.sqrt(b2.vx * b2.vx + b2.vy * b2.vy)
    let dir1 = Math.atan2(b1.vy, b1.vx)
    let dir2 = Math.atan2(b2.vy, b2.vx)

    let vx1 = speed1 * Math.cos(dir1 - deg)
    let vy1 = speed1 * Math.sin(dir1 - deg)
    let vx2 = speed2 * Math.cos(dir2 - deg)
    let vy2 = speed2 * Math.sin(dir2 - deg)

    let fx1 = vx2
    let fy1 = vy1
    let fx2 = vx1
    let fy2 = vy2

    b1.fx = Math.cos(deg) * fx1 + Math.cos(deg + Math.PI / 2) * fy1
    b1.fy = Math.sin(deg) * fx1 + Math.sin(deg + Math.PI / 2) * fy1
    b2.fx = Math.cos(deg) * fx2 + Math.cos(deg + Math.PI / 2) * fy2
    b2.fy = Math.sin(deg) * fx2 + Math.sin(deg + Math.PI / 2) * fy2
  }
  // 更新
  update() {
    // 只需要计算更新实体球
    this.vBalls = this.vBalls.map(ball => {
      // 超出页面范围重置到镜像位置
      if (ball.x < -ball.r) {
        ball.x = ball.x + this.width
      } else if (ball.x > this.width + ball.r) {
        ball.x = ball.x - this.width
      } else if (ball.y < -ball.r) {
        ball.y = ball.y + this.height
      } else if (ball.y > this.height + ball.r) {
        ball.y = ball.y - this.height
      }

      // 碰撞处理
      if (ball.isCrash && ball.fx !== void 0 && ball.fy !== void 0) {
        ball.isCrash = false

        ball.vx = ball.fx
        ball.vy = ball.fy
      }

      // 在鼠标范围内（排斥）
      if (ball.withMouse === WITH_MOUSE.INSIDE) {
        let g = Math.random() * 0.02

        if (ball.y > this.mouse.y) {
          ball.vy = ball.vy * 0.99 + g
        } else {
          ball.vy = ball.vy * 0.99 - g
        }

        if (ball.x > this.mouse.x) {
          ball.vx = ball.vx * 0.99 + g
        } else {
          ball.vx = ball.vx * 0.99 - g
        }
      }

      // 如果鼠标停留在球上则不运动
      if (ball.withMouse !== WITH_MOUSE.OVERLAP) {
        ball.x += ball.vx
        ball.y += ball.vy
      }

      // 更新小球颜色
      this.updateGradientData(ball)

      return ball
    })

    this.updateGradientData(this.mouse)
    this.updateGradientData(this.bg)
    this.updateGradientData(this.text)
  }

  /** 初始化颜色渐变对象 */
  initGradientData(period: number, colors: number[][]): IColor {
    let ColorList = this.getColorList(colors)
    return {
      cur_i: 0, // 当前颜色step
      cur_color: 0, // 当前颜色组索引
      color: colors[0], // 当前颜色
      changeValue: ColorList.length / (period / 16.7), // 每次渲染变化量
      ColorList: ColorList, // 当前颜色范围
      ColorGroup: colors, // 渐变颜色组
    }
  }

  /** 更新颜色 */
  updateGradientData(ball: IColor) {
    let index: number
    // 颜色停留时间
    let pauseTime = ball.ColorGroup[ball.cur_color][3]

    if (pauseTime) {
      let v = pauseTime / 16.7
      if (ball.cur_i <= v) {
        ball.cur_i += 1
        return false
      } else {
        ball.cur_i += ball.changeValue
        index = ~~(ball.cur_i - v)
      }
    } else {
      ball.cur_i += ball.changeValue
      index = ~~ball.cur_i
    }

    if (index === ball.cur_i) {
      return false
    }

    // 更新颜色
    ball.color = ball.color.map((n, i) => {
      if (index >= ball.ColorList.length) {
        ball.cur_i = index = 0
        ball.cur_color++
        ball.cur_color = ball.cur_color % ball.ColorGroup.length
        if (ball.cur_color === ball.ColorGroup.length - 1) {
          ball.ColorList = this.getColorList([
            ball.ColorGroup[ball.cur_color],
            ball.ColorGroup[0],
          ])
        } else {
          ball.ColorList = this.getColorList([
            ball.ColorGroup[ball.cur_color],
            ball.ColorGroup[ball.cur_color + 1],
          ])
        }
      }
      return ball.ColorList.length ? ball.ColorList[index][i] : n
    })
  }

  /** 根据颜色数组获取rgba颜色字符串 */
  getRGBA(color: string | number[], opacity: number = 1) {
    return color === 'transparent'
      ? color
      : `rgba(${~~color[0]}, ${~~color[1]}, ${~~color[2]}, ${opacity})`
  }

  /** 根据范围得到一个随机数 args: [范围] */
  getRandomNumber(arr: number[]) {
    return Math.random() * (arr[1] - arr[0]) + arr[0]
  }

  /** 画各种类型的圆 */
  renderTypeArc(
    x: number,
    y: number,
    r: number,
    color: string,
    innerR?: number,
    centerR?: number,
  ) {
    this.ctx.fillStyle = color

    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, Math.PI * 2, true)
    innerR && this.ctx.arc(x, y, innerR, 0, Math.PI * 2, false)
    centerR && this.ctx.arc(x, y, centerR, 0, Math.PI * 2, true)

    this.ctx.fill()
  }

  /** 画一个实心圆 */
  renderArc(x: number, y: number, r: number, color: string) {
    this.ctx.fillStyle = color

    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, Math.PI * 2, true)

    this.ctx.fill()
  }

  /** 画一个圆环 */
  renderRing(x: number, y: number, r: number, color: string, innerR: number) {
    this.ctx.fillStyle = color

    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, Math.PI * 2, true)
    this.ctx.arc(x, y, innerR, 0, Math.PI * 2, false)

    this.ctx.fill()
  }

  /** 画一个双圆 */
  renderDoubleArc(
    x: number,
    y: number,
    r: number,
    color: string,
    innerR: number,
    centerR: number,
  ) {
    this.ctx.fillStyle = color

    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, Math.PI * 2, true)
    this.ctx.arc(x, y, innerR, 0, Math.PI * 2, false)
    this.ctx.arc(x, y, r, 0, Math.PI * 2, true)

    this.ctx.fill()
  }

  /** 画一条线 */
  renderLine(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)

    this.ctx.stroke()
  }

  /** 画个三角形 */
  renderTri<T extends { x: number; y: number }>(
    coordinate1: T,
    coordinate2: T,
    coordinate3: T,
  ) {
    this.ctx.beginPath()
    this.ctx.moveTo(coordinate1.x, coordinate1.y)
    this.ctx.lineTo(coordinate2.x, coordinate2.y)
    this.ctx.lineTo(coordinate3.x, coordinate3.y)
    this.ctx.lineTo(coordinate1.x, coordinate1.y)
    this.ctx.closePath()

    this.ctx.stroke()
  }
  // 填充背景色
  renderBackground() {
    this.ctx.fillStyle = this.getRGBA(this.bg.color)
    this.ctx.fillRect(0, 0, this.width, this.height)
  }
  // 写字
  renderText() {
    this.ctx.save()

    this.ctx.font = this.font
    const fontSizeMatch = this.font.match(/\d+(?=px)/)
    const fontSize =
      fontSizeMatch && fontSizeMatch.length > 0
        ? parseInt(fontSizeMatch[0])
        : 12
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = this.getRGBA(this.text.color, 0.8)
    this.ctx.fillText(this.txt, this.width / 2, this.height / 2 + fontSize / 2)

    this.ctx.font = this.bottomFont
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = this.getRGBA(this.text.color, 0.6)
    this.ctx.fillText(
      this.bottomTxt,
      this.width / 2,
      this.height / 2 + fontSize + 30,
    )

    this.ctx.restore()
  }
}
